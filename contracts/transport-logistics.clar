;; Transport Logistics Contract
;; Coordinates organ preservation and delivery

;; Define data variables
(define-data-var transport-id-counter uint u0)

(define-map transports
  { id: uint }
  {
    match-id: uint,
    organ-type: (string-ascii 20),
    source-hospital-id: uint,
    destination-hospital-id: uint,
    courier-id: uint,
    status: (string-ascii 20),  ;; "preparing", "in-transit", "delivered", "failed"
    notes: (string-ascii 100)
  }
)

(define-map couriers
  { id: uint }
  {
    name: (string-ascii 50),
    contact: (string-ascii 50),
    is-active: bool
  }
)

;; Error codes
(define-constant ERR_UNAUTHORIZED u1)
(define-constant ERR_NOT_FOUND u2)
(define-constant ERR_INVALID_INPUT u3)

;; Contract owner
(define-data-var contract-owner principal tx-sender)

;; Create a transport (contract owner only)
(define-public (create-transport
                (match-id uint)
                (organ-type (string-ascii 20))
                (source-hospital-id uint)
                (destination-hospital-id uint)
                (courier-id uint))
  (let
    (
      (transport-id (+ (var-get transport-id-counter) u1))
      (courier-data (unwrap! (map-get? couriers { id: courier-id }) (err ERR_NOT_FOUND)))
    )
    ;; Check if caller is contract owner
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR_UNAUTHORIZED))

    ;; Check if courier is active
    (asserts! (get is-active courier-data) (err ERR_INVALID_INPUT))

    ;; Update counter
    (var-set transport-id-counter transport-id)

    ;; Store transport information
    (map-set transports
      { id: transport-id }
      {
        match-id: match-id,
        organ-type: organ-type,
        source-hospital-id: source-hospital-id,
        destination-hospital-id: destination-hospital-id,
        courier-id: courier-id,
        status: "preparing",
        notes: "Transport created"
      }
    )

    (ok transport-id)
  )
)

;; Update transport status (contract owner only)
(define-public (update-transport-status
                (transport-id uint)
                (status (string-ascii 20))
                (notes (string-ascii 100)))
  (let
    (
      (transport-data (unwrap! (map-get? transports { id: transport-id }) (err ERR_NOT_FOUND)))
    )
    ;; Check if caller is contract owner
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR_UNAUTHORIZED))

    ;; Validate status
    (asserts! (or (is-eq status "preparing")
                 (is-eq status "in-transit")
                 (is-eq status "delivered")
                 (is-eq status "failed"))
              (err ERR_INVALID_INPUT))

    ;; Update transport status
    (map-set transports
      { id: transport-id }
      (merge transport-data
        {
          status: status,
          notes: notes
        }
      )
    )

    (ok true)
  )
)

;; Add courier (contract owner only)
(define-public (add-courier (courier-id uint) (name (string-ascii 50)) (contact (string-ascii 50)))
  (begin
    ;; Only contract owner can add couriers
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR_UNAUTHORIZED))

    ;; Add courier
    (map-set couriers
      { id: courier-id }
      {
        name: name,
        contact: contact,
        is-active: true
      }
    )

    (ok true)
  )
)

;; Deactivate courier (contract owner only)
(define-public (deactivate-courier (courier-id uint))
  (let
    (
      (courier-data (unwrap! (map-get? couriers { id: courier-id }) (err ERR_NOT_FOUND)))
    )
    ;; Check if caller is contract owner
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR_UNAUTHORIZED))

    ;; Update courier status
    (map-set couriers
      { id: courier-id }
      (merge courier-data { is-active: false })
    )

    (ok true)
  )
)

;; Read-only functions
(define-read-only (get-transport (transport-id uint))
  (map-get? transports { id: transport-id })
)

(define-read-only (get-courier (courier-id uint))
  (map-get? couriers { id: courier-id })
)

;; Set contract owner
(define-public (set-contract-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR_UNAUTHORIZED))
    (ok (var-set contract-owner new-owner))
  )
)

