;; Recipient Listing Contract
;; Manages waitlist and medical compatibility data

;; Define data variables
(define-data-var recipient-id-counter uint u0)

(define-map recipients
  { id: uint }
  {
    principal: principal,
    name: (string-ascii 50),
    blood-type: (string-ascii 3),
    needed-organ: (string-ascii 20),
    medical-urgency: uint,  ;; 1-10 scale, 10 being most urgent
    hospital-id: uint,
    is-active: bool
  }
)

(define-map hospitals
  { id: uint }
  {
    name: (string-ascii 50),
    location: (string-ascii 100)
  }
)

;; Error codes
(define-constant ERR_UNAUTHORIZED u1)
(define-constant ERR_NOT_FOUND u2)
(define-constant ERR_INVALID_INPUT u3)

;; Contract owner
(define-data-var contract-owner principal tx-sender)

;; Register a recipient (contract owner only)
(define-public (register-recipient
                (patient-principal principal)
                (name (string-ascii 50))
                (blood-type (string-ascii 3))
                (needed-organ (string-ascii 20))
                (medical-urgency uint)
                (hospital-id uint))
  (let
    (
      (recipient-id (+ (var-get recipient-id-counter) u1))
    )
    ;; Check if caller is contract owner
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR_UNAUTHORIZED))

    ;; Validate inputs
    (asserts! (> (len name) u0) (err ERR_INVALID_INPUT))
    (asserts! (> (len blood-type) u0) (err ERR_INVALID_INPUT))
    (asserts! (> (len needed-organ) u0) (err ERR_INVALID_INPUT))
    (asserts! (and (>= medical-urgency u1) (<= medical-urgency u10)) (err ERR_INVALID_INPUT))

    ;; Update counter
    (var-set recipient-id-counter recipient-id)

    ;; Store recipient information
    (map-set recipients
      { id: recipient-id }
      {
        principal: patient-principal,
        name: name,
        blood-type: blood-type,
        needed-organ: needed-organ,
        medical-urgency: medical-urgency,
        hospital-id: hospital-id,
        is-active: true
      }
    )

    (ok recipient-id)
  )
)

;; Update recipient urgency (contract owner only)
(define-public (update-urgency (recipient-id uint) (medical-urgency uint))
  (let
    (
      (recipient-data (unwrap! (map-get? recipients { id: recipient-id }) (err ERR_NOT_FOUND)))
    )
    ;; Check if caller is contract owner
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR_UNAUTHORIZED))

    ;; Validate inputs
    (asserts! (and (>= medical-urgency u1) (<= medical-urgency u10)) (err ERR_INVALID_INPUT))

    ;; Update recipient information
    (map-set recipients
      { id: recipient-id }
      (merge recipient-data { medical-urgency: medical-urgency })
    )

    (ok true)
  )
)

;; Deactivate recipient (contract owner only)
(define-public (deactivate-recipient (recipient-id uint))
  (let
    (
      (recipient-data (unwrap! (map-get? recipients { id: recipient-id }) (err ERR_NOT_FOUND)))
    )
    ;; Check if caller is contract owner
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR_UNAUTHORIZED))

    ;; Update recipient status
    (map-set recipients
      { id: recipient-id }
      (merge recipient-data { is-active: false })
    )

    (ok true)
  )
)

;; Add hospital (contract owner only)
(define-public (add-hospital (hospital-id uint) (name (string-ascii 50)) (location (string-ascii 100)))
  (begin
    ;; Only contract owner can add hospitals
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR_UNAUTHORIZED))

    ;; Add hospital
    (map-set hospitals
      { id: hospital-id }
      {
        name: name,
        location: location
      }
    )

    (ok true)
  )
)

;; Read-only functions
(define-read-only (get-recipient (recipient-id uint))
  (map-get? recipients { id: recipient-id })
)

(define-read-only (get-hospital (hospital-id uint))
  (map-get? hospitals { id: hospital-id })
)

;; Set contract owner
(define-public (set-contract-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR_UNAUTHORIZED))
    (ok (var-set contract-owner new-owner))
  )
)

