;; Matching Algorithm Contract
;; Determines optimal donor-recipient matches

;; Define data variables
(define-data-var match-id-counter uint u0)

(define-map matches
  { id: uint }
  {
    donor-id: uint,
    recipient-id: uint,
    organ-type: (string-ascii 20),
    compatibility-score: uint,  ;; 1-100 scale, 100 being perfect match
    status: (string-ascii 10)   ;; "pending", "accepted", "rejected", "completed"
  }
)

;; Error codes
(define-constant ERR_UNAUTHORIZED u1)
(define-constant ERR_NOT_FOUND u2)
(define-constant ERR_INVALID_INPUT u3)

;; Contract owner
(define-data-var contract-owner principal tx-sender)

;; Create a match (contract owner only)
(define-public (create-match
                (donor-id uint)
                (recipient-id uint)
                (organ-type (string-ascii 20))
                (compatibility-score uint))
  (let
    (
      (match-id (+ (var-get match-id-counter) u1))
    )
    ;; Check if caller is contract owner
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR_UNAUTHORIZED))

    ;; Validate inputs
    (asserts! (and (>= compatibility-score u1) (<= compatibility-score u100)) (err ERR_INVALID_INPUT))

    ;; Update counter
    (var-set match-id-counter match-id)

    ;; Store match information
    (map-set matches
      { id: match-id }
      {
        donor-id: donor-id,
        recipient-id: recipient-id,
        organ-type: organ-type,
        compatibility-score: compatibility-score,
        status: "pending"
      }
    )

    (ok match-id)
  )
)

;; Accept a match (contract owner only)
(define-public (accept-match (match-id uint))
  (let
    (
      (match-data (unwrap! (map-get? matches { id: match-id }) (err ERR_NOT_FOUND)))
    )
    ;; Check if caller is contract owner
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR_UNAUTHORIZED))

    ;; Check if match is pending
    (asserts! (is-eq (get status match-data) "pending") (err ERR_INVALID_INPUT))

    ;; Update match status
    (map-set matches
      { id: match-id }
      (merge match-data { status: "accepted" })
    )

    (ok true)
  )
)

;; Reject a match (contract owner only)
(define-public (reject-match (match-id uint))
  (let
    (
      (match-data (unwrap! (map-get? matches { id: match-id }) (err ERR_NOT_FOUND)))
    )
    ;; Check if caller is contract owner
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR_UNAUTHORIZED))

    ;; Check if match is pending
    (asserts! (is-eq (get status match-data) "pending") (err ERR_INVALID_INPUT))

    ;; Update match status
    (map-set matches
      { id: match-id }
      (merge match-data { status: "rejected" })
    )

    (ok true)
  )
)

;; Complete a match (contract owner only)
(define-public (complete-match (match-id uint))
  (let
    (
      (match-data (unwrap! (map-get? matches { id: match-id }) (err ERR_NOT_FOUND)))
    )
    ;; Check if caller is contract owner
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR_UNAUTHORIZED))

    ;; Check if match is accepted
    (asserts! (is-eq (get status match-data) "accepted") (err ERR_INVALID_INPUT))

    ;; Update match status
    (map-set matches
      { id: match-id }
      (merge match-data { status: "completed" })
    )

    (ok true)
  )
)

;; Read-only functions
(define-read-only (get-match (match-id uint))
  (map-get? matches { id: match-id })
)

;; Set contract owner
(define-public (set-contract-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR_UNAUTHORIZED))
    (ok (var-set contract-owner new-owner))
  )
)

