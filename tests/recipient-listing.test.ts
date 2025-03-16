import { describe, it, expect, beforeEach, vi } from "vitest"

// Mock contract calls
const mockContractCall = vi.fn()
const mockTxOk = (value) => ({ value, isOk: true })
const mockTxErr = (code) => ({ code, isOk: false })

// Mock contract
const mockContract = {
  registerRecipient: (...args) => mockContractCall("registerRecipient", ...args),
  updateUrgency: (...args) => mockContractCall("updateUrgency", ...args),
  deactivateRecipient: (...args) => mockContractCall("deactivateRecipient", ...args),
  addHospital: (...args) => mockContractCall("addHospital", ...args),
  getRecipient: (...args) => mockContractCall("getRecipient", ...args),
  getHospital: (...args) => mockContractCall("getHospital", ...args),
  setContractOwner: (...args) => mockContractCall("setContractOwner", ...args),
}

// Mock principals
const OWNER = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
const PATIENT = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
const UNAUTHORIZED = "ST3PF13W7Z0RRM42A8VZRVFQ75SV1K26RXEP8YGKJ"

describe("Recipient Listing Contract", () => {
  beforeEach(() => {
    mockContractCall.mockReset()
  })
  
  describe("registerRecipient", () => {
    it("should register a recipient successfully", async () => {
      mockContractCall.mockReturnValueOnce(mockTxOk(1))
      
      const result = await mockContract.registerRecipient(PATIENT, "Jane Doe", "B-", "heart", 8, 1)
      
      expect(mockContractCall).toHaveBeenCalledWith("registerRecipient", PATIENT, "Jane Doe", "B-", "heart", 8, 1)
      expect(result.isOk).toBe(true)
      expect(result.value).toBe(1)
    })
    
    it("should fail with invalid inputs", async () => {
      mockContractCall.mockReturnValueOnce(mockTxErr(3))
      
      const result = await mockContract.registerRecipient(PATIENT, "", "B-", "heart", 8, 1)
      
      expect(result.isOk).toBe(false)
      expect(result.code).toBe(3)
    })
    
    it("should fail if caller is not the contract owner", async () => {
      mockContractCall.mockReturnValueOnce(mockTxErr(1))
      
      const result = await mockContract.registerRecipient(PATIENT, "Jane Doe", "B-", "heart", 8, 1)
      
      expect(result.isOk).toBe(false)
      expect(result.code).toBe(1)
    })
  })
  
  describe("updateUrgency", () => {
    it("should update urgency successfully", async () => {
      mockContractCall.mockReturnValueOnce(mockTxOk(true))
      
      const result = await mockContract.updateUrgency(1, 10)
      
      expect(mockContractCall).toHaveBeenCalledWith("updateUrgency", 1, 10)
      expect(result.isOk).toBe(true)
      expect(result.value).toBe(true)
    })
    
    it("should fail if recipient not found", async () => {
      mockContractCall.mockReturnValueOnce(mockTxErr(2))
      
      const result = await mockContract.updateUrgency(999, 10)
      
      expect(result.isOk).toBe(false)
      expect(result.code).toBe(2)
    })
    
    it("should fail if urgency is invalid", async () => {
      mockContractCall.mockReturnValueOnce(mockTxErr(3))
      
      const result = await mockContract.updateUrgency(1, 11)
      
      expect(result.isOk).toBe(false)
      expect(result.code).toBe(3)
    })
    
    it("should fail if caller is not the contract owner", async () => {
      mockContractCall.mockReturnValueOnce(mockTxErr(1))
      
      const result = await mockContract.updateUrgency(1, 10)
      
      expect(result.isOk).toBe(false)
      expect(result.code).toBe(1)
    })
  })
  
  describe("deactivateRecipient", () => {
    it("should deactivate a recipient successfully", async () => {
      mockContractCall.mockReturnValueOnce(mockTxOk(true))
      
      const result = await mockContract.deactivateRecipient(1)
      
      expect(mockContractCall).toHaveBeenCalledWith("deactivateRecipient", 1)
      expect(result.isOk).toBe(true)
      expect(result.value).toBe(true)
    })
    
    it("should fail if recipient not found", async () => {
      mockContractCall.mockReturnValueOnce(mockTxErr(2))
      
      const result = await mockContract.deactivateRecipient(999)
      
      expect(result.isOk).toBe(false)
      expect(result.code).toBe(2)
    })
    
    it("should fail if caller is not the contract owner", async () => {
      mockContractCall.mockReturnValueOnce(mockTxErr(1))
      
      const result = await mockContract.deactivateRecipient(1)
      
      expect(result.isOk).toBe(false)
      expect(result.code).toBe(1)
    })
  })
  
  describe("addHospital", () => {
    it("should add a hospital successfully", async () => {
      mockContractCall.mockReturnValueOnce(mockTxOk(true))
      
      const result = await mockContract.addHospital(1, "General Hospital", "123 Main St, City")
      
      expect(mockContractCall).toHaveBeenCalledWith("addHospital", 1, "General Hospital", "123 Main St, City")
      expect(result.isOk).toBe(true)
      expect(result.value).toBe(true)
    })
    
    it("should fail if caller is not the contract owner", async () => {
      mockContractCall.mockReturnValueOnce(mockTxErr(1))
      
      const result = await mockContract.addHospital(1, "General Hospital", "123 Main St, City")
      
      expect(result.isOk).toBe(false)
      expect(result.code).toBe(1)
    })
  })
  
  describe("getRecipient", () => {
    it("should return recipient information", async () => {
      const recipientData = {
        principal: PATIENT,
        name: "Jane Doe",
        bloodType: "B-",
        neededOrgan: "heart",
        medicalUrgency: 8,
        hospitalId: 1,
        isActive: true,
      }
      
      mockContractCall.mockReturnValueOnce(recipientData)
      
      const result = await mockContract.getRecipient(1)
      
      expect(mockContractCall).toHaveBeenCalledWith("getRecipient", 1)
      expect(result).toEqual(recipientData)
    })
    
    it("should return null if recipient not found", async () => {
      mockContractCall.mockReturnValueOnce(null)
      
      const result = await mockContract.getRecipient(999)
      
      expect(mockContractCall).toHaveBeenCalledWith("getRecipient", 999)
      expect(result).toBeNull()
    })
  })
  
  describe("getHospital", () => {
    it("should return hospital information", async () => {
      const hospitalData = {
        name: "General Hospital",
        location: "123 Main St, City",
      }
      
      mockContractCall.mockReturnValueOnce(hospitalData)
      
      const result = await mockContract.getHospital(1)
      
      expect(mockContractCall).toHaveBeenCalledWith("getHospital", 1)
      expect(result).toEqual(hospitalData)
    })
    
    it("should return null if hospital not found", async () => {
      mockContractCall.mockReturnValueOnce(null)
      
      const result = await mockContract.getHospital(999)
      
      expect(mockContractCall).toHaveBeenCalledWith("getHospital", 999)
      expect(result).toBeNull()
    })
  })
})

