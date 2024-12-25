'use server'

import { cache } from 'react'
import mockData from '@/lib/mock-data.json'
import { Bill } from '@/types/bill'
import { Payment } from '@/types/payment'

// Helper function to simulate variable network latency
function simulateNetworkDelay(baseDelay = 500) {
  const jitter = Math.random() * 300 // Add 0-300ms of random jitter
  return new Promise((resolve) => setTimeout(resolve, baseDelay + jitter))
}

export const getBills = cache(async (): Promise<Bill[]> => {
  await simulateNetworkDelay(600) // Slightly longer for fetching list
  return mockData.bills
})

export const getBillById = cache(async (id: string): Promise<Bill | null> => {
  await simulateNetworkDelay(400) // Faster for single item lookup
  const bill = mockData.bills.find((b) => b.id === id)
  return bill || null
})

export const getPayments = cache(async (): Promise<Payment[]> => {
  await simulateNetworkDelay(600)
  return mockData.payments
})

export const getPaymentsByBillId = cache(async (billId: string): Promise<Payment[]> => {
  await simulateNetworkDelay(400)
  return mockData.payments.filter((p) => p.billId === billId)
})

export async function createBill(bill: Omit<Bill, 'id'>): Promise<Bill> {
  await simulateNetworkDelay(800) // Longer for write operations
  const newBill: Bill = {
    id: `bill_${Date.now()}`,
    ...bill
  }
  return newBill
}

export async function updateBill(id: string, billUpdate: Partial<Omit<Bill, 'id'>>): Promise<Bill> {
  await simulateNetworkDelay(800)
  const bill = await getBillById(id)
  if (!bill) throw new Error('Bill not found')
  
  return {
    ...bill,
    ...billUpdate
  }
}

export async function deleteBill(id: string): Promise<string> {
  await simulateNetworkDelay(700)
  return id
}

export async function createPayment(payment: Omit<Payment, 'id'>): Promise<Payment> {
  await simulateNetworkDelay(800)
  const newPayment: Payment = {
    id: `pay_${Date.now()}`,
    ...payment
  }
  return newPayment
}

export async function deletePayment(id: string): Promise<string> {
  await simulateNetworkDelay(700)
  return id
}

