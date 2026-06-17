
  // Dynamic Tab Switching
  const pageTitles = {
    'dashboard': 'Overview',
    'orders': 'Bookings & Orders',
    'users': 'User Directory',
    'store': 'Products & Inventory',
    'otps': 'OTP Monitoring',
    'logins': 'Login Logs'
  };

  function switchAdminTab(tab) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.add('d-none'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    // Show target page
    const page = document.getElementById('page-' + tab);
    if (page) page.classList.remove('d-none');
    
    // Highlight sidebar link
    const navItem = document.querySelector(`.nav-item[onclick*="${tab}"]`);
    if (navItem) navItem.classList.add('active');
    
    // Title update
    document.getElementById('page-title').textContent = pageTitles[tab] || 'Admin';
  }

  // Filter Bookings/Orders
  function filterOrders() {
    const status = document.getElementById('filter-order-status').value;
    const query = document.getElementById('search-orders').value.trim().toLowerCase();
    
    document.querySelectorAll('.order-row').forEach(row => {
      const matchStatus = !status || row.dataset.status === status;
      const matchSearch = !query || row.dataset.search.includes(query);
      
      if (matchStatus && matchSearch) {
        row.classList.remove('d-none');
      } else {
        row.classList.add('d-none');
      }
    });
  }

  // Filter Users
  function filterUsers() {
    const role = document.getElementById('filter-user-role').value;
    const query = document.getElementById('search-users').value.trim().toLowerCase();
    
    document.querySelectorAll('.user-row').forEach(row => {
      const matchRole = !role || row.dataset.role === role;
      const matchSearch = !query || row.dataset.search.includes(query);
      
      if (matchRole && matchSearch) {
        row.classList.remove('d-none');
      } else {
        row.classList.add('d-none');
      }
    });
  }

  // Filter OTPs
  function filterOtps() {
    const query = document.getElementById('search-otps').value.trim().toLowerCase();
    document.querySelectorAll('.otp-row').forEach(row => {
      if (!query || row.dataset.search.includes(query)) {
        row.classList.remove('d-none');
      } else {
        row.classList.add('d-none');
      }
    });
  }

  // Filter Logins
  function filterLogins() {
    const query = document.getElementById('search-logins').value.trim().toLowerCase();
    document.querySelectorAll('.login-row').forEach(row => {
      if (!query || row.dataset.search.includes(query)) {
        row.classList.remove('d-none');
      } else {
        row.classList.add('d-none');
      }
    });
  }

  // Modal actions
  function openStatusModal(orderId, currentStatus) {
    try {
      document.getElementById('modal-order-id').value = orderId;
      document.getElementById('modal-delivery-status').value = currentStatus;
      const modal = document.getElementById('status-modal');
      modal.classList.add('open');
      modal.style.display = 'flex';
    } catch(e) {
      alert("Error: " + e.message);
    }
  }

  function closeAdminModal() {
    const modal = document.getElementById('status-modal');
    modal.classList.remove('open');
    modal.style.display = 'none';
  }

  // Activity log display
  function viewUserActivity(name, escapedJson) {
    const logs = JSON.parse(unescape(escapedJson));
    document.getElementById('modal-activity-title').textContent = `${name}'s Activity History`;
    
    const body = document.getElementById('modal-activity-body');
    if (logs.length === 0) {
      body.innerHTML = 'No activities recorded for this user.';
    } else {
      body.innerHTML = logs.reverse().map(l => `
        <div style="border-bottom: 1px solid var(--rule); padding: 6px 0;">
          <strong>[${new Date(l.timestamp).toLocaleString('en-IN')}]</strong> ${l.action}<br>
          <span style="font-size:0.75rem; color:#7F8C8D;">IP: ${l.ip || '127.0.0.1'} | Browser: ${l.userAgent || '—'}</span>
        </div>
      `).join('');
    }
    
    document.getElementById('activity-modal').classList.add('open');
  }

  function closeActivityModal() {
    document.getElementById('activity-modal').classList.remove('open');
  }

  // Store actions
  function openAddProductModal() {
    const modal = document.getElementById('add-product-modal');
    modal.classList.add('open');
    modal.style.display = 'flex';
  }
  function closeAddProductModal() {
    const modal = document.getElementById('add-product-modal');
    modal.classList.remove('open');
    modal.style.display = 'none';
  }
  function openEditProductModal(escapedProd) {
    const p = JSON.parse(unescape(escapedProd));
    document.getElementById('edit-product-form').action = '/admin/products/edit/' + p.productId;
    document.getElementById('edit-product-name').value = p.name;
    document.getElementById('edit-product-category').value = p.category;
    document.getElementById('edit-product-sku').value = p.sku || '';
    document.getElementById('edit-product-price').value = p.price;
    document.getElementById('edit-product-discount').value = p.discountPrice || '';
    document.getElementById('edit-product-stock').value = p.stock;
    document.getElementById('edit-product-status').value = p.status;
    document.getElementById('edit-product-delivery').value = p.deliveryAvailable.toString();
    document.getElementById('edit-product-description').value = p.description || '';
    
    const modal = document.getElementById('edit-product-modal');
    modal.classList.add('open');
    modal.style.display = 'flex';
  }
  function closeEditProductModal() {
    const modal = document.getElementById('edit-product-modal');
    modal.classList.remove('open');
    modal.style.display = 'none';
  }
  function filterProducts() {
    const query = document.getElementById('search-products').value.trim().toLowerCase();
    document.querySelectorAll('.product-row').forEach(row => {
      row.classList.toggle('d-none', query && !row.dataset.search.includes(query));
    });
  }

  // Client Side CSV Export helper
  function exportUsersToCSV() {
    // We call the server endpoint to fetch clean CSV
    window.open('/admin/export-users', '_blank');
  }

  // Toast notifier
  let toastTimer;
  function showToast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
  }

  // Show status success message on page load if query param present
  window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'status') {
      showToast('✓ Order status updated successfully!');
      switchAdminTab('orders');
    }
    if (urlParams.get('success') === 'deleted') {
      showToast('✓ Order record deleted successfully!');
      switchAdminTab('orders');
    }
    if (urlParams.get('success') === 'product-added') {
      showToast('📦 Product added successfully!');
      switchAdminTab('store');
    }
    if (urlParams.get('success') === 'product-updated') {
      showToast('📦 Product updated successfully!');
      switchAdminTab('store');
    }
    if (urlParams.get('success') === 'product-deleted') {
      showToast('🗑️ Product deleted successfully!');
      switchAdminTab('store');
    }
  });

  // Close modals on clicking overlay
  document.getElementById('status-modal').addEventListener('click', function(e) { if(e.target===this) closeAdminModal(); });
  document.getElementById('activity-modal').addEventListener('click', function(e) { if(e.target===this) closeActivityModal(); });
