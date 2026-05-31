// Mock Booking Flow System
import { marketplacePosts } from './utils/mock-data.js';

window.showBookingModal = function(postId) {
    const post = marketplacePosts.find(p => p.id === postId);
    if (!post) return;
    
    // Check if modal exists, if not create it
    let modalEl = document.getElementById('mpBookingModal');
    if (!modalEl) {
        const modalHtml = `
            <div class="modal fade" id="mpBookingModal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content mp-modal-content">
                        <div class="modal-header mp-modal-header bg-primary text-white">
                            <h5 class="modal-title fw-bold" id="bookingModalTitle">Xác Nhận Tham Gia</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body p-4" id="bookingModalBody">
                            <!-- Dynamic Content -->
                        </div>
                        <div class="modal-footer border-top-0 px-4 pb-4">
                            <button type="button" class="btn btn-light rounded-pill px-4 fw-bold" data-bs-dismiss="modal">Hủy</button>
                            <button type="button" class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" id="btnConfirmBooking">Xác Nhận & Thanh Toán</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- QR Payment Mock Modal -->
            <div class="modal fade" id="mpPaymentModal" tabindex="-1" data-bs-backdrop="static">
                <div class="modal-dialog modal-dialog-centered modal-sm">
                    <div class="modal-content rounded-4 border-0 shadow-lg text-center p-4">
                        <h5 class="fw-bold mb-3 text-primary">Thanh Toán QR</h5>
                        <div class="p-3 bg-light rounded-3 mb-3 d-inline-block border">
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MOCK_PAYMENT" alt="QR Code">
                        </div>
                        <p class="small text-muted mb-3">Vui lòng quét mã QR qua ứng dụng ngân hàng hoặc ví điện tử để hoàn tất thanh toán.</p>
                        <h4 class="fw-bold text-danger mb-4" id="paymentTotalAmount">0đ</h4>
                        <div class="spinner-border text-primary spinner-border-sm mb-2" role="status"></div>
                        <p class="small text-primary fw-bold">Đang chờ thanh toán...</p>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        modalEl = document.getElementById('mpBookingModal');
    }
    
    const isFree = post.price === 0;
    const body = document.getElementById('bookingModalBody');
    
    // Generate Time Slots based on unit
    let timeSelectionHtml = '';
    if (post.priceUnit === 'giờ') {
        timeSelectionHtml = `
            <div class="mb-4">
                <label class="form-label fw-bold small text-muted">Chọn thời lượng</label>
                <div class="d-flex gap-2">
                    <div class="time-slot selected flex-fill" data-hours="1">1 Giờ</div>
                    <div class="time-slot flex-fill" data-hours="2">2 Giờ</div>
                    <div class="time-slot flex-fill" data-hours="3">3 Giờ</div>
                    <div class="time-slot flex-fill" data-hours="4">4 Giờ</div>
                </div>
            </div>
        `;
    } else {
        timeSelectionHtml = `
            <div class="mb-4">
                <label class="form-label fw-bold small text-muted">Số lượng</label>
                <div class="input-group" style="width: 150px;">
                    <button class="btn btn-outline-secondary" type="button" onclick="updateQty(-1)">-</button>
                    <input type="text" class="form-control text-center" id="bookingQty" value="1" readonly>
                    <button class="btn btn-outline-secondary" type="button" onclick="updateQty(1)">+</button>
                </div>
            </div>
        `;
    }
    
    body.innerHTML = `
        <div class="d-flex align-items-center mb-4 p-3 bg-light rounded-3 border">
            <img src="${post.thumbnail}" class="rounded-3 me-3" style="width: 60px; height: 60px; object-fit: cover;">
            <div>
                <h6 class="fw-bold mb-1">${post.title}</h6>
                <div class="text-primary fw-bold">${formatPrice(post.price)} / ${post.priceUnit}</div>
            </div>
        </div>
        
        ${timeSelectionHtml}
        
        <div class="bg-light p-3 rounded-3 border mt-3">
            <div class="d-flex justify-content-between mb-2">
                <span class="text-muted">Đơn giá:</span>
                <span class="fw-bold">${formatPrice(post.price)}</span>
            </div>
            <div class="d-flex justify-content-between mb-2">
                <span class="text-muted">Phí dịch vụ:</span>
                <span class="fw-bold">Miễn phí</span>
            </div>
            <hr class="opacity-25 my-2">
            <div class="d-flex justify-content-between align-items-center">
                <span class="fw-bold fs-5">Tổng tiền:</span>
                <span class="fw-bold fs-4 text-danger" id="bookingTotal">${formatPrice(post.price)}</span>
            </div>
        </div>
    `;
    
    // Bind logic for time slots / qty
    let totalMultiplier = 1;
    const updateTotal = () => {
        document.getElementById('bookingTotal').innerText = formatPrice(post.price * totalMultiplier);
    };
    
    setTimeout(() => {
        const slots = document.querySelectorAll('.time-slot');
        if (slots.length > 0) {
            slots.forEach(slot => {
                slot.addEventListener('click', () => {
                    slots.forEach(s => s.classList.remove('selected'));
                    slot.classList.add('selected');
                    totalMultiplier = parseInt(slot.getAttribute('data-hours'));
                    updateTotal();
                });
            });
        }
        
        window.updateQty = (change) => {
            const input = document.getElementById('bookingQty');
            let val = parseInt(input.value) + change;
            if (val < 1) val = 1;
            if (val > (post.slots - post.joined)) val = post.slots - post.joined;
            input.value = val;
            totalMultiplier = val;
            updateTotal();
        };
        
        // Confirm Button Logic
        const btnConfirm = document.getElementById('btnConfirmBooking');
        btnConfirm.onclick = () => {
            const finalPrice = post.price * totalMultiplier;
            
            // Hide booking modal
            const bookingModal = bootstrap.Modal.getInstance(document.getElementById('mpBookingModal'));
            bookingModal.hide();
            
            if (finalPrice > 0) {
                // Show QR Payment Modal
                document.getElementById('paymentTotalAmount').innerText = formatPrice(finalPrice);
                const paymentModal = new bootstrap.Modal(document.getElementById('mpPaymentModal'));
                paymentModal.show();
                
                // Simulate payment success after 3 seconds
                setTimeout(() => {
                    paymentModal.hide();
                    window.showToast('Thanh toán thành công! Bạn đã tham gia sự kiện.', 'success');
                    // In real app: refresh UI
                }, 3000);
            } else {
                window.showToast('Tham gia thành công!', 'success');
            }
        };
    }, 100);
    
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
};

function formatPrice(price) {
    if (price === 0) return "Miễn phí";
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}
