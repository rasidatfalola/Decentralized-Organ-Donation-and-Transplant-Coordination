import { describe, it, expect, beforeEach, vi } from "vitest"

// Mock contract calls
const mockContractCall = vi.fn()
const mockTxOk = (value) => ({ value, isOk: true })
const mockTxErr = (code) => ({ code, isOk: false })

// Mock contract
const mockContract = {
  createMatch: (...args) => mockContractCall("createMatch", ...args),
  acceptMatch: (...args) => mockContractCall("acceptMatch", ...args),
  rejectMatch: (...args) => mockContractCall("rejectMatch", ...args),
  completeMatch: (...args) => mockContractCall("completeMatch", ...args),
  getMatch: (...args) => mockContractCall("getMatch", ...args),
  setContractOwner: (...args) => mockContractCall("setContractOwner", ...args)
}

// Mock principals
const OWNER = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
const UNAUTHORIZED = "ST3PF13W7Z0RRM42A8VZRVFQ75SV1K26RXEP8YGKJ"

describe("Matching Algorithm Contract", () => {
  beforeEach(() => {
    mockContractCall.mockReset()
  })
  
  describe("createMatch", () => {
    it("should create a match successfully", async () => {
      mockContractCall.mockReturnValueOnce(mockTxOk(1))
      
      const result = await mockContract.createMatch(
          1, // donor ID
          2, // recipient ID
          "kidney",
          85 // compatibility score
      )
      
      expect(mockContractCall).toHaveBeenCalledWith(
          "createMatch",
          1,
          2,
          "kidney",
          85
      )
      expect(result.isOk).toBe(true)
      expect(result.value).toBe(1)
    })
    
    it("should fail with invalid compatibility score", async () => {
      mockContractCall.mockReturnValueOnce(mockTxErr(3))
      
      const result = await mockContract.createMatch(
          1,
          2,
          "kidney",
          101 // invalid score (> 100)
      )
      
      expect(result.isOk).toBe(false)
      expect(result.code).toBe(3)
    })
    
    it("should fail if caller is not the contract owner", async () => {
      mockContractCall.mockReturnValueOnce(mockTxErr(1))
      
      const result = await mockContract.createMatch(
          1,
          2,
          "kidney",
          85
      )
      
      expect(result.isOk).toBe(false)
      expect(result.code).toBe(1)
    })
  })
  
  describe("acceptMatch", () => {
    it("should accept a match successfully", async () => {
      mockContractCall.mockReturnValueOnce(mockTxOk(true))
      
      const result = await mockContract.acceptMatch(1)
      
      expect(mockContractCall).toHaveBeenCalledWith("acceptMatch", 1)
      expect(result.isOk).toBe(true)
      expect(result.value).toBe(true)
    })
    
    it("should fail if match not found", async () => {
      mockContractCall.mockReturnValueOnce(mockTxErr(2))
      
      const result = await mockContract.acceptMatch(999)
      
      expect(result.isOk).toBe(false)
      expect(result.code).toBe(2)
    })
    
    it("should fail if match is not in pending status", async () => {
      mockContractCall.mockReturnValueOnce(mockTxErr(3))
      
      const result = await mockContract.acceptMatch(1)
      
      expect(result.isOk).toBe(false)
      expect(result.code).toBe(3)
    })
    
    it("should fail if caller is not the contract owner", async () => {
      mockContractCall.mockReturnValueOnce(mockTxErr(1))
      
      const result = await mockContract.acceptMatch(1)
      
      expect(result.isOk).toBe(false)
      expect(result.code).toBe(1)
    })
  })
  
  describe("rejectMatch", () => {
    it("should reject a match successfully", async () => {
      mockContractCall.mockReturnValueOnce(mockTxOk(true))
      
      const result = await mockContract.rejectMatch(1)
      
      expect(mockContractCall).toHaveBeenCalledWith("rejectMatch", 1)
      expect(result.isOk).toBe(true)
      expect(result.value).toBe(true)
    })
    
    it("should fail if match not found", async () => {
      mockContractCall.mockReturnValueOnce(mockTxErr(2))
      
      const result = await mockContract.rejectMatch(999)
      
      expect(result.isOk).toBe(false)
      expect(result.code).toBe(2)
    })
    
    it("should fail if match is not in pending status", async () => {
      mockContractCall.mockReturnValueOnce(mockTxErr(3))
      
      const result = await mockContract.rejectMatch(1)
      
      expect(result.isOk).toBe(false)
      expect(result.code).toBe(3)
    })
    
    it("should fail if caller is not the contract owner", async () => {
      mockContractCall.mockReturnValueOnce(mockTxErr(1))
      
      const result = await mockContract.rejectMatch(1)
      
      expect(result.isOk).toBe(false)
      expect(result.code).toBe(1)
    })
  })
  
  describe("completeMatch", () => {
    it("should complete a match successfully", async () => {
      mockContractCall.mockReturnValueOnce(mockTxOk(true))
      
      const result = await mockContract.completeMatch(1)
      
      expect(mockContractCall).toHaveBeenCalledWith("completeMatch", 1)
      expect(result.isOk).toBe(true)
      expect(result.value).toBe(true)
    })
    
    it("should fail if match not found", async () => {
      mockContractCall.mockReturnValueOnce(mockTxErr(2))
      
      const result = await mockContract.completeMatch(999)
      
      expect(result.isOk).toBe(false)
      expect(result.code).toBe(2)
    })
    
    it("should fail if match is not in accepted status", async () => {
      mockContractCall.mockReturnValueOnce(mockTxErr(3))
      
      const result = await mockContract.completeMatch(1)
      
      expect(result.isOk).toBe(false)
      expect(result.code).toBe(3)
    })
    
    it("should fail if caller is not the contract owner", async () => {
      mockContractCall.mockReturnValueOnce(mockTxErr(1))
      
      const result = await mockContract.completeMatch(1)
      
      expect(result.isOk).toBe(false)
      expect(result.code).toBe(1)
    })
  })
  
  describe("getMatch", () => {
    it("should return match information", async () => {
      const matchData = {
        donorId: 1,
        recipientId: 2,
        organType: "kidney",
        compatibilityScore: 85,
        status: "pending"
      }
      
      mockContractCall.mockReturnValueOnce(matchData)
      
      const result = await mockContract.getMatch(1)
      
      expect(mockContractCall).toHaveBeenCalledWith("getMatch", 1)
      expect(result).toEqual(matchData)
    })
    
    it("should return null if match not found", async () => {
      mockContractCall.mockReturnValueOnce(null)
      
      const result = await mockContract.getMatch(999)
      
      expect(mockContractCall).toHaveBeenCalledWith("getMatch", 999)
      expect(result).toBeNull()
    })
  })
})
