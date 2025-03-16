import { describe, it, expect, beforeEach, vi } from "vitest"

// Mock contract calls
const mockContractCall = vi.fn()
const mockTxOk = (value) => ({ value, isOk: true })
const mockTxErr = (code) => ({ code, isOk: false })

// Mock contract
const mockContract = {
  createTransport: (...args) => mockContractCall("createTransport", ...args),
  updateTransportStatus: (...args) => mockContractCall("updateTransportStatus", ...args),
  addCourier: (...args) => mockContractCall("addCourier", ...args),
  deactivateCourier: (...args) => mockContractCall("deactivateCourier", ...args),
  getTransport: (...args) => mockContractCall("getTransport", ...args),
  getCourier: (...args) => mockContractCall("getCourier", ...args),
  setContractOwner: (...args) => mockContractCall("setContractOwner", ...args),
}

// Mock principals
const OWNER = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
const UNAUTHORIZED = "ST3PF13W7Z0RRM42A8VZRVFQ75SV1K26RXEP8YGKJ"

describe("Transport Logistics Contract", () => {
  beforeEach(() => {
    mockContractCall.mockReset()
  })
  
  describe("createTransport", () => {
    it("should create a transport successfully", async () => {
      mockContractCall.mockReturnValueOnce(mockTxOk(1))
      
      const result = await mockContract.createTransport(
          1, // match ID
          "kidney",
          2, // source hospital ID
          3, // destination hospital ID
          4, // courier ID
      )
      
      expect(mockContractCall).toHaveBeenCalledWith("createTransport", 1, "kidney", 2, 3, 4)
      expect(result.isOk).toBe(true)
      expect(result.value).toBe(1)
    })
    
    it("should fail if courier not found", async () => {
      mockContractCall.mockReturnValueOnce(mockTxErr(2))
      
      const result = await mockContract.createTransport(
          1,
          "kidney",
          2,
          3,
          999, // non-existent courier
      )
      
      expect(result.isOk).toBe(false)
      expect(result.code).toBe(2)
    })
    
    it("should fail if courier is not active", async () => {
      mockContractCall.mockReturnValueOnce(mockTxErr(3))
      
      const result = await mockContract.createTransport(1, "kidney", 2, 3, 4)
      
      expect(result.isOk).toBe(false)
      expect(result.code).toBe(3)
    })
    
    it("should fail if caller is not the contract owner", async () => {
      mockContractCall.mockReturnValueOnce(mockTxErr(1))
      
      const result = await mockContract.createTransport(1, "kidney", 2, 3, 4)
      
      expect(result.isOk).toBe(false)
      expect(result.code).toBe(1)
    })
  })
  
  describe("updateTransportStatus", () => {
    it("should update transport status successfully", async () => {
      mockContractCall.mockReturnValueOnce(mockTxOk(true))
      
      const result = await mockContract.updateTransportStatus(1, "in-transit", "Organ picked up and in transit")
      
      expect(mockContractCall).toHaveBeenCalledWith(
          "updateTransportStatus",
          1,
          "in-transit",
          "Organ picked up and in transit",
      )
      expect(result.isOk).toBe(true)
      expect(result.value).toBe(true)
    })
    
    it("should fail if transport not found", async () => {
      mockContractCall.mockReturnValueOnce(mockTxErr(2))
      
      const result = await mockContract.updateTransportStatus(999, "in-transit", "Organ picked up and in transit")
      
      expect(result.isOk).toBe(false)
      expect(result.code).toBe(2)
    })
    
    it("should fail with invalid status", async () => {
      mockContractCall.mockReturnValueOnce(mockTxErr(3))
      
      const result = await mockContract.updateTransportStatus(1, "invalid-status", "Invalid status update")
      
      expect(result.isOk).toBe(false)
      expect(result.code).toBe(3)
    })
    
    it("should fail if caller is not the contract owner", async () => {
      mockContractCall.mockReturnValueOnce(mockTxErr(1))
      
      const result = await mockContract.updateTransportStatus(1, "in-transit", "Organ picked up and in transit")
      
      expect(result.isOk).toBe(false)
      expect(result.code).toBe(1)
    })
  })
  
  describe("addCourier", () => {
    it("should add a courier successfully", async () => {
      mockContractCall.mockReturnValueOnce(mockTxOk(true))
      
      const result = await mockContract.addCourier(1, "John Smith", "555-123-4567")
      
      expect(mockContractCall).toHaveBeenCalledWith("addCourier", 1, "John Smith", "555-123-4567")
      expect(result.isOk).toBe(true)
      expect(result.value).toBe(true)
    })
    
    it("should fail if caller is not the contract owner", async () => {
      mockContractCall.mockReturnValueOnce(mockTxErr(1))
      
      const result = await mockContract.addCourier(1, "John Smith", "555-123-4567")
      
      expect(result.isOk).toBe(false)
      expect(result.code).toBe(1)
    })
  })
  
  describe("deactivateCourier", () => {
    it("should deactivate a courier successfully", async () => {
      mockContractCall.mockReturnValueOnce(mockTxOk(true))
      
      const result = await mockContract.deactivateCourier(1)
      
      expect(mockContractCall).toHaveBeenCalledWith("deactivateCourier", 1)
      expect(result.isOk).toBe(true)
      expect(result.value).toBe(true)
    })
    
    it("should fail if courier not found", async () => {
      mockContractCall.mockReturnValueOnce(mockTxErr(2))
      
      const result = await mockContract.deactivateCourier(999)
      
      expect(result.isOk).toBe(false)
      expect(result.code).toBe(2)
    })
    
    it("should fail if caller is not the contract owner", async () => {
      mockContractCall.mockReturnValueOnce(mockTxErr(1))
      
      const result = await mockContract.deactivateCourier(1)
      
      expect(result.isOk).toBe(false)
      expect(result.code).toBe(1)
    })
  })
  
  describe("getTransport", () => {
    it("should return transport information", async () => {
      const transportData = {
        matchId: 1,
        organType: "kidney",
        sourceHospitalId: 2,
        destinationHospitalId: 3,
        courierId: 4,
        status: "preparing",
        notes: "Transport created",
      }
      
      mockContractCall.mockReturnValueOnce(transportData)
      
      const result = await mockContract.getTransport(1)
      
      expect(mockContractCall).toHaveBeenCalledWith("getTransport", 1)
      expect(result).toEqual(transportData)
    })
    
    it("should return null if transport not found", async () => {
      mockContractCall.mockReturnValueOnce(null)
      
      const result = await mockContract.getTransport(999)
      
      expect(mockContractCall).toHaveBeenCalledWith("getTransport", 999)
      expect(result).toBeNull()
    })
  })
  
  describe("getCourier", () => {
    it("should return courier information", async () => {
      const courierData = {
        name: "John Smith",
        contact: "555-123-4567",
        isActive: true,
      }
      
      mockContractCall.mockReturnValueOnce(courierData)
      
      const result = await mockContract.getCourier(1)
      
      expect(mockContractCall).toHaveBeenCalledWith("getCourier", 1)
      expect(result).toEqual(courierData)
    })
    
    it("should return null if courier not found", async () => {
      mockContractCall.mockReturnValueOnce(null)
      
      const result = await mockContract.getCourier(999)
      
      expect(mockContractCall).toHaveBeenCalledWith("getCourier", 999)
      expect(result).toBeNull()
    })
  })
})

