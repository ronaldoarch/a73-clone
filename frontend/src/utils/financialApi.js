import { trpcQuery, trpcMutation } from './api'

export async function editAssetPassword(params) {
  return trpcMutation('withdraw.editAssetPassword', params)
}

export async function getUserFlow() {
  return trpcQuery('withdraw.getUserFlow')
}

export async function getWithdrawType() {
  return trpcQuery('withdraw.type')
}

export async function getWithdrawAccount(params) {
  return trpcQuery('withdraw.getWithdrawAccount', params)
}

export async function createWithdrawOrder(params) {
  return trpcMutation('withdraw.createOrder', params)
}

export async function getWithdrawRecord(params) {
  return trpcQuery('withdraw.record', params)
}

export async function getPayList() {
  return trpcQuery('pay.list')
}

export async function getPayRecordList(params) {
  return trpcQuery('pay.recordList', params)
}

export async function createPayOrder(params) {
  return trpcMutation('pay.create', params)
}

export async function getPayChannelList(params) {
  return trpcQuery('pay.channelList', params)
}

export async function payAgain(params) {
  return trpcMutation('pay.payAgain', params)
}

export async function payConfirm(params) {
  return trpcMutation('pay.payConfirm', params)
}

export async function getFlowList(params) {
  return trpcQuery('flow.list', params)
}

export async function getFlowDetails(params) {
  return trpcQuery('flow.details', params)
}

export async function editWithdrawAccount(params) {
  return trpcMutation('withdraw.editAccount', params)
}

export async function deleteWithdrawAccount(ids) {
  return trpcMutation('withdraw.deleteWithdrawAccount', { ids })
}

export async function getWithdrawTypeAndSub() {
  return trpcQuery('withdraw.withdrawTypeAndSub')
}

export async function getUserWithdrawInfo() {
  return trpcQuery('withdraw.getUserWithdrawInfo')
}

export async function bindCPF(params) {
  return trpcMutation('pay.bindCPF', params)
}

export async function updateVoucher(params) {
  return trpcMutation('pay.updateVoucher', params)
}

export async function getWalletBalance(walletCode) {
  return trpcQuery('wallet.balance', { walletCode })
}

export async function getWalletHall(walletCode) {
  return trpcQuery('wallet.hall', { walletCode })
}

export async function getBankList(params) {
  return trpcQuery('bank.list', { page: 1, pageSize: 1000, ...params })
}

export async function getUserDetails() {
  return trpcQuery('user.details')
}

export async function getUserAssets() {
  return trpcQuery('user.assets')
}

export async function getFavoriteList() {
  return trpcQuery('user.favoriteList', { page: 1, pageSize: 1000 })
}

export async function addFavorite(params) {
  return trpcMutation('user.addFavorite', params)
}

export async function cancelFavorite(params) {
  return trpcMutation('user.cancelFavorite', params)
}

export async function getUnreadMailCount() {
  return trpcQuery('user.unreadMailCount')
}

export async function getAnnouncements() {
  return trpcQuery('announcement.loginOut')
}
