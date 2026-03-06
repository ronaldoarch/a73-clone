#!/usr/bin/env python3
"""
Backend de autenticação: login, cadastro e verificação.
Usa JSON para persistência (sem dependências externas).
"""

import hashlib
import json
import os
import secrets
import uuid
from pathlib import Path

_BASE = Path(__file__).resolve().parent.parent
USERS_FILE = _BASE / "users.json"
TOKEN_PREFIX = "a73_"


def _load_users():
    """Carrega usuários do arquivo JSON."""
    if not USERS_FILE.exists():
        return {}
    try:
        with open(USERS_FILE, encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return {}


def _save_users(users):
    """Salva usuários no arquivo JSON."""
    os.makedirs(USERS_FILE.parent, exist_ok=True)
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(users, f, indent=2, ensure_ascii=False)


def _hash_password(password):
    """Hash da senha com salt."""
    salt = "a73_salt_v1"
    return hashlib.sha256((salt + str(password)).encode()).hexdigest()


def _verify_password(password, stored_hash):
    return _hash_password(password) == stored_hash


def _make_token():
    return TOKEN_PREFIX + secrets.token_urlsafe(32)


def _user_response(user_id, account, token):
    """Resposta no formato esperado pelo app."""
    return {
        "token": token,
        "user": {
            "id": user_id,
            "account": account,
            "username": account,
            "tenantId": 1,
        },
        "loginType": "account",
    }


def login(account: str, password: str, phone: str = None, **kwargs) -> dict:
    """
    Login com conta e senha.
    Retorna { token, user, loginType } em sucesso.
    Retorna { error, code } em falha.
    """
    acc = (account or phone or kwargs.get("account") or "").strip()
    if not acc or not password:
        return {"error": "Conta e senha são obrigatórios", "code": "INVALID_INPUT"}

    users = _load_users()
    digits_only = "".join(c for c in acc if c.isdigit())
    account_lower = (digits_only if len(digits_only) >= 10 else acc).lower()
    if account_lower not in users:
        if acc.lower() in users:
            account_lower = acc.lower()
        else:
            return {"error": "Conta ou senha incorretos", "code": "INVALID_CREDENTIALS"}

    u = users[account_lower]
    if not _verify_password(password, u["passwordHash"]):
        return {"error": "Conta ou senha incorretos", "code": "INVALID_CREDENTIALS"}

    token = _make_token()
    u["token"] = token
    _save_users(users)

    return _user_response(u["id"], u.get("account", acc), token)


def register(account: str, password: str, confirm_password: str = None, **kwargs) -> dict:
    """
    Cadastro de nova conta.
    Retorna { token, user, loginType } em sucesso.
    Retorna { error, code } em falha.
    Se account estiver vazio, gera um automaticamente (user_xxxx).
    """
    if not password:
        return {"error": "Senha é obrigatória", "code": "INVALID_INPUT"}

    confirm = confirm_password or kwargs.get("confirmPassword") or kwargs.get("confirm_password")
    if confirm and password != confirm:
        return {"error": "As senhas não coincidem", "code": "PASSWORD_MISMATCH"}

    account_clean = (account or kwargs.get("phone") or "").strip()
    if not account_clean:
        account_clean = "user_" + secrets.token_hex(4)
    digits_only = "".join(c for c in account_clean if c.isdigit())
    if len(digits_only) >= 10:
        account_clean = digits_only
    if len(account_clean) < 3:
        return {"error": "Telefone ou conta deve ter pelo menos 3 caracteres", "code": "INVALID_INPUT"}

    if len(password) < 4:
        return {"error": "Senha deve ter pelo menos 4 caracteres", "code": "INVALID_INPUT"}

    users = _load_users()
    account_lower = account_clean.lower()
    if account_lower in users:
        return {"error": "Conta já existe", "code": "ACCOUNT_EXISTS"}

    user_id = str(uuid.uuid4())[:8]
    token = _make_token()
    users[account_lower] = {
        "id": user_id,
        "account": account_clean,
        "passwordHash": _hash_password(password),
        "token": token,
    }
    _save_users(users)

    return _user_response(user_id, account_clean, token)


def send_verify_code(account: str = None, phone: str = None, email: str = None, **kwargs) -> dict:
    """
    Mock: envia código de verificação (não envia de verdade).
    Retorna sucesso para não bloquear o fluxo.
    """
    return {"success": True, "message": "Código enviado (mock)"}


def verify_code(account: str = None, code: str = None, **kwargs) -> dict:
    """
    Mock: verifica código (aceita qualquer código em ambiente local).
    Retorna sucesso para não bloquear o fluxo.
    """
    return {"success": True, "verified": True}
