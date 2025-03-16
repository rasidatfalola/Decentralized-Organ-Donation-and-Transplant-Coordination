;; Donor Registration Contract
;; Records donor consent and medical information

;; Define data variables
(define-data-var donor-id-counter uint u0)

(define-map donors
  { id: uint }
  {
    principal: principal,
    name: (string-ascii 50),
    blood-type: (string-ascii 3),
    organ-types: (list 5 (string-ascii 20)),
    consent-given: bool,
    is-active: bool
  }
)

;; Error codes
(define-constant ERR_UNAUTHORIZED u1)
(define-constant ERR_NOT_FOUND u2)
(define-constant ERR_INVALID_INPUT u3)

;; Contract owner
(define-data-var contract-owner principal tx-sender)

;; Register as a donor
(define-public (register-donor
                (name (string-ascii 50))
                (blood-type (string-ascii 3))
                (organ-types (list 5 (string-ascii 20))))
  (let
    (
      (donor-id (+ (var-get donor-id-counter) u1))
    )
    ;; Validate inputs
    (asserts! (> (len name) u0) (err ERR_INVALID_INPUT))
    (asserts! (> (len blood-type) u0) (err ERR_INVALID_INPUT))
    (asserts! (> (len organ-types) u0) (err ERR_INVALID_INPUT))

    ;; Update counter
    (var-set donor-id-counter donor-id)

    ;; Store donor information
    (map-set donors
      { id: donor-id }
      {
        principal: tx-sender,
        name: name,
        blood-type: blood-type,
        organ-types: organ-types,
        consent-given: true,
        is-active: true
      }
    )

    (ok donor-id)
  )
)

;; Revoke consent
(define-public (revoke-consent (donor-id uint))
  (let
    (
      (donor-data (unwrap! (map-get? donors { id: donor-id }) (err ERR_NOT_FOUND)))
    )
    ;; Check if caller is the donor
    (asserts! (is-eq tx-sender (get principal donor-data)) (err ERR_UNAUTHORIZED))

    ;; Update consent status
    (map-set donors
      { id: donor-id }
      (merge donor-data { consent-given: false, is-active: false })
    )

    (ok true)
  )
)

;; Verify donor (contract owner only)
(define-public (verify-donor (donor-id uint))
  (let
    (
      (donor-data (unwrap! (map-get? donors { id: donor-id }) (err ERR_NOT_FOUND)))
    )
    ;; Check if caller is contract owner
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR_UNAUTHORIZED))

    ;; Update verification status
    (map-set donors
      { id: donor-id }
      (merge donor-data { is-active: true })
    )

    (ok true)
  )
)

;; Read-only functions
(define-read-only (get-donor (donor-id uint))
  (map-get? donors { id: donor-id })
)

;; Set contract owner
(define-public (set-contract-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR_UNAUTHORIZED))
    (ok (var-set contract-owner new-owner))
  )
)

