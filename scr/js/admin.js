/***********************
 * ADMIN CONSTANTS
 ***********************/
const ADMIN_KEY = "adminUser";
const CATEGORIES_KEY = "categories";
const BRANDS_KEY = "brands";
const ADMIN_PRODUCTS_KEY = "adminProducts";
const ADMIN_ORDERS_KEY = "adminOrders";

/***********************
 * INITIALIZATION
 ***********************/
document.addEventListener("DOMContentLoaded", () => {
    console.log('Admin panel loading...');
    
    try {
        // Check admin authentication
        if (!checkAdminAuth()) {
            return;
        }
        
        // Initialize data FIRST
        initializeAdminData();
        
        // Load dashboard immediately
        setTimeout(() => {
            showSection('dashboard');
            loadDashboardData();
            
            // Update website categories
            updateWebsiteCategories();
            updateBrandOptions();
        }, 200);
        
        console.log('Admin panel loaded successfully');
    } catch (error) {
        console.error('Error loading admin panel:', error);
        alert('Lỗi khi tải admin panel. Hãy mở fix-admin.html để sửa lỗi.');
    }
});

/***********************
 * AUTHENTICATION
 ***********************/
function checkAdminAuth() {
    const adminUser = localStorage.getItem(ADMIN_KEY);
    if (!adminUser) {
        // Redirect to main page instead of admin-login.html
        window.location.href = "index.html";
        return false;
    }
    return true;
}

function showAdminLogin() {
    // Redirect to main page for login instead of admin-login.html
    window.location.href = "index.html";
    return false;
}

function logout() {
    // Hiển thị thông báo đăng xuất
    alert("Đã đăng xuất Admin thành công!");
    
    // Xóa tất cả session (cả admin và user)
    localStorage.removeItem(ADMIN_KEY);
    localStorage.removeItem('currentUser'); // Xóa session user
    localStorage.removeItem('adminUser'); // Xóa session admin khác nếu có
    
    // Chuyển về trang chính
    window.location.href = "index.html";
}

/***********************
 * DATA INITIALIZATION
 ***********************/
function initializeAdminData() {
    console.log('Initializing admin data...');
    
    // Check if data reset flag is set - if so, don't create sample data
    if (localStorage.getItem('preventSampleData') === 'true') {
        console.log('Sample data creation prevented by reset flag');
        return;
    }
    
    // Initialize categories if not exists
    if (!localStorage.getItem(CATEGORIES_KEY)) {
        console.log('Creating default categories...');
        const defaultCategories = [
            { id: 1, name: "Ngũ cốc bổ dưỡng", value: "Nutritious cereals" },
            { id: 2, name: "Các loại đậu", value: "Pulses" },
            { id: 3, name: "Gia vị và nước chấm", value: "Spices and Condiments" },
            { id: 4, name: "Thực phẩm chức năng và mỹ phẩm thiên nhiên", value: "Cooking oils" },
            { id: 5, name: "Gạo và các sản phẩm từ gạo", value: "Rice" },
            { id: 6, name: "Bột mì & Bột ngũ cốc", value: "Flours & Meals" },
            { id: 7, name: "Rau củ tươi", value: "Fresh Vegetables" }
        ];
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(defaultCategories));
        console.log('Default categories created:', defaultCategories);
    } else {
        console.log('Categories already exist');
    }

    // Initialize brands if not exists
    if (!localStorage.getItem(BRANDS_KEY)) {
        console.log('Creating default brands...');
        const defaultBrands = [
            { id: 1, name: "Cascadian Farm", description: "Thương hiệu thực phẩm hữu cơ cao cấp" },
            { id: 2, name: "Great Value", description: "Thương hiệu giá trị tốt" },
            { id: 3, name: "Organic Valley", description: "Sản phẩm hữu cơ chất lượng cao" },
            { id: 4, name: "Star Organic", description: "Thương hiệu chính của trang trại" },
            { id: 5, name: "Nature's Path", description: "Thực phẩm hữu cơ tự nhiên" }
        ];
        localStorage.setItem(BRANDS_KEY, JSON.stringify(defaultBrands));
        console.log('Default brands created:', defaultBrands);
    } else {
        console.log('Brands already exist');
    }

    // Initialize admin products if not exists
    if (!localStorage.getItem(ADMIN_PRODUCTS_KEY)) {
        console.log('Creating empty admin products array...');
        localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify([]));
    } else {
        console.log('Admin products already exist');
    }
}

/***********************
 * NAVIGATION
 ***********************/
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update active nav link
    const navLinks = document.querySelectorAll('.sidebar .nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    
    // Find the nav link by data-section attribute
    const activeLink = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Load section data
    switch(sectionName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'categories':
            loadCategories();
            break;
        case 'brands':
            loadBrands();
            break;
        case 'products':
            loadProducts();
            break;
        case 'orders':
            loadOrders();
            updateOrdersBadge(); // Update badge when viewing orders
            break;
        case 'customers':
            loadCustomers();
            break;
        case 'statistics':
            loadStatistics();
            break;
    }
}

// Function to update orders badge
function updateOrdersBadge() {
    const allOrders = JSON.parse(localStorage.getItem("orders")) || {};
    let totalOrders = 0;
    
    Object.keys(allOrders).forEach(username => {
        const userOrders = allOrders[username] || [];
        totalOrders += userOrders.length;
    });
    
    const ordersBadge = document.getElementById('ordersBadge');
    if (ordersBadge) {
        if (totalOrders > 0) {
            ordersBadge.textContent = totalOrders;
            ordersBadge.style.display = 'inline-block';
        } else {
            ordersBadge.style.display = 'none';
        }
    }
}

/***********************
 * DASHBOARD
 ***********************/
function loadDashboardData() {
    const products = JSON.parse(localStorage.getItem(ADMIN_PRODUCTS_KEY)) || [];
    const allOrders = JSON.parse(localStorage.getItem("orders")) || {};
    const users = JSON.parse(localStorage.getItem("users")) || [];
    
    // Lọc bỏ admin users - chỉ đếm khách hàng thực
    const customers = users.filter(user => 
        user.username !== 'admin' && 
        user.role !== 'admin'
    );
    
    // Đếm tổng số đơn hàng và tính doanh thu theo trạng thái
    let totalOrders = 0;
    let totalRevenue = 0;
    let pendingOrders = 0;
    let completedOrders = 0;
    
    Object.keys(allOrders).forEach(username => {
        const userOrders = allOrders[username] || [];
        totalOrders += userOrders.length;
        
        userOrders.forEach(order => {
            const orderTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            // Đếm theo trạng thái
            if (order.status === 'pending') {
                pendingOrders++;
            } else if (order.status === 'completed') {
                completedOrders++;
                totalRevenue += orderTotal; // Chỉ tính doanh thu cho đơn hoàn thành
            }
        });
    });
    
    // Update dashboard cards
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('totalCustomers').textContent = customers.length;
    document.getElementById('totalRevenue').textContent = formatVND(totalRevenue);
    
    // Update orders badge in sidebar
    updateOrdersBadge();
    
    // Create charts with a small delay to ensure DOM is ready
    setTimeout(() => {
        createRevenueChart();
        createOrderStatusChart();
    }, 100);
    
    // Log statistics for debugging
    console.log(`Dashboard stats: ${products.length} products, ${totalOrders} orders (${pendingOrders} pending, ${completedOrders} completed), ${customers.length} customers, ${formatVND(totalRevenue)} revenue`);
}

/***********************
 * CATEGORIES MANAGEMENT
 ***********************/
function loadCategories() {
    const categories = JSON.parse(localStorage.getItem(CATEGORIES_KEY)) || [];
    const tbody = document.getElementById('categoriesTable');
    
    tbody.innerHTML = '';
    
    categories.forEach(category => {
        const products = JSON.parse(localStorage.getItem(ADMIN_PRODUCTS_KEY)) || [];
        const productCount = products.filter(p => p.category === category.value).length;
        
        tbody.innerHTML += `
            <tr>
                <td>${category.id}</td>
                <td>${category.name}</td>
                <td>${productCount}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editCategory(${category.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteCategory(${category.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

function showAddCategoryModal() {
    document.getElementById('categoryModalTitle').innerHTML = '<i class="fas fa-tags me-2"></i>Thêm danh mục';
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryId').value = '';
    new bootstrap.Modal(document.getElementById('categoryModal')).show();
}

function editCategory(id) {
    const categories = JSON.parse(localStorage.getItem(CATEGORIES_KEY)) || [];
    const category = categories.find(c => c.id === id);
    
    if (category) {
        document.getElementById('categoryModalTitle').innerHTML = '<i class="fas fa-tags me-2"></i>Sửa danh mục';
        document.getElementById('categoryId').value = category.id;
        document.getElementById('categoryName').value = category.name;
        new bootstrap.Modal(document.getElementById('categoryModal')).show();
    }
}

function saveCategory() {
    const id = document.getElementById('categoryId').value;
    const name = document.getElementById('categoryName').value.trim();
    
    if (!name) {
        alert('Vui lòng nhập tên danh mục');
        return;
    }
    
    let categories = JSON.parse(localStorage.getItem(CATEGORIES_KEY)) || [];
    
    if (id) {
        // Edit existing category
        const index = categories.findIndex(c => c.id === parseInt(id));
        if (index !== -1) {
            categories[index].name = name;
        }
    } else {
        // Add new category
        const newId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1;
        const value = name.toLowerCase().replace(/\s+/g, '-');
        categories.push({ id: newId, name: name, value: value });
    }
    
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    bootstrap.Modal.getInstance(document.getElementById('categoryModal')).hide();
    loadCategories();
    updateWebsiteCategories();
}

function deleteCategory(id) {
    if (confirm('Bạn có chắc muốn xóa danh mục này?')) {
        let categories = JSON.parse(localStorage.getItem(CATEGORIES_KEY)) || [];
        categories = categories.filter(c => c.id !== id);
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
        loadCategories();
        updateWebsiteCategories();
    }
}

/***********************
 * BRANDS MANAGEMENT
 ***********************/
function loadBrands() {
    const brands = JSON.parse(localStorage.getItem(BRANDS_KEY)) || [];
    const tbody = document.getElementById('brandsTable');
    
    tbody.innerHTML = '';
    
    brands.forEach(brand => {
        const products = JSON.parse(localStorage.getItem(ADMIN_PRODUCTS_KEY)) || [];
        const productCount = products.filter(p => p.brand === brand.name).length;
        
        tbody.innerHTML += `
            <tr>
                <td>${brand.id}</td>
                <td>${brand.name}</td>
                <td>${productCount}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editBrand(${brand.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteBrand(${brand.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

function showAddBrandModal() {
    document.getElementById('brandModalTitle').innerHTML = '<i class="fas fa-award me-2"></i>Thêm thương hiệu';
    document.getElementById('brandForm').reset();
    document.getElementById('brandId').value = '';
    new bootstrap.Modal(document.getElementById('brandModal')).show();
}

function editBrand(id) {
    const brands = JSON.parse(localStorage.getItem(BRANDS_KEY)) || [];
    const brand = brands.find(b => b.id === id);
    
    if (brand) {
        document.getElementById('brandModalTitle').innerHTML = '<i class="fas fa-award me-2"></i>Sửa thương hiệu';
        document.getElementById('brandId').value = brand.id;
        document.getElementById('brandName').value = brand.name;
        document.getElementById('brandDescription').value = brand.description || '';
        new bootstrap.Modal(document.getElementById('brandModal')).show();
    }
}

function saveBrand() {
    const id = document.getElementById('brandId').value;
    const name = document.getElementById('brandName').value.trim();
    const description = document.getElementById('brandDescription').value.trim();
    
    if (!name) {
        alert('Vui lòng nhập tên thương hiệu');
        return;
    }
    
    let brands = JSON.parse(localStorage.getItem(BRANDS_KEY)) || [];
    
    if (id) {
        // Edit existing brand
        const index = brands.findIndex(b => b.id === parseInt(id));
        if (index !== -1) {
            brands[index].name = name;
            brands[index].description = description;
        }
    } else {
        // Add new brand
        const newId = brands.length > 0 ? Math.max(...brands.map(b => b.id)) + 1 : 1;
        brands.push({ id: newId, name: name, description: description });
    }
    
    localStorage.setItem(BRANDS_KEY, JSON.stringify(brands));
    bootstrap.Modal.getInstance(document.getElementById('brandModal')).hide();
    loadBrands();
    updateBrandOptions();
}

function deleteBrand(id) {
    if (confirm('Bạn có chắc muốn xóa thương hiệu này?')) {
        let brands = JSON.parse(localStorage.getItem(BRANDS_KEY)) || [];
        brands = brands.filter(b => b.id !== id);
        localStorage.setItem(BRANDS_KEY, JSON.stringify(brands));
        loadBrands();
        updateBrandOptions();
    }
}

// Hàm cập nhật dropdown thương hiệu trong form sản phẩm
function updateBrandOptions() {
    const brands = JSON.parse(localStorage.getItem(BRANDS_KEY)) || [];
    const select = document.getElementById('productBrand');
    
    if (select) {
        // Lưu giá trị hiện tại
        const currentValue = select.value;
        
        // Cập nhật options
        select.innerHTML = '<option value="">Chọn thương hiệu</option>';
        brands.forEach(brand => {
            select.innerHTML += `<option value="${brand.name}">${brand.name}</option>`;
        });
        
        // Khôi phục giá trị nếu có
        if (currentValue) {
            select.value = currentValue;
        }
    }
}

/***********************
 * PRODUCTS MANAGEMENT
 ***********************/
function loadProducts() {
    const products = JSON.parse(localStorage.getItem(ADMIN_PRODUCTS_KEY)) || [];
    const tbody = document.getElementById('productsTable');
    
    tbody.innerHTML = '';
    
    products.forEach(product => {
        const statusClass = product.stock > 0 ? 'badge-success' : 'badge-danger';
        const statusText = product.stock > 0 ? 'Còn hàng' : 'Hết hàng';
        
        tbody.innerHTML += `
            <tr>
                <td>${product.id}</td>
                <td><img src="${product.thumbnail}" alt="${product.title}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"></td>
                <td>${product.title}</td>
                <td>${product.category}</td>
                <td>${formatVND(product.price)}</td>
                <td>${product.stock}</td>
                <td><span class="badge ${statusClass}">${statusText}</span></td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

function showAddProductModal() {
    try {
        // Kiểm tra các element cần thiết
        const modal = document.getElementById('productModal');
        const form = document.getElementById('productForm');
        const title = document.getElementById('productModalTitle');
        
        if (!modal || !form || !title) {
            console.error('Product modal elements not found');
            alert('Lỗi: Không tìm thấy modal sản phẩm');
            return;
        }
        
        // Reset form và title
        title.innerHTML = '<i class="fas fa-box me-2"></i>Thêm sản phẩm';
        form.reset();
        document.getElementById('productId').value = '';
        
        // Clear image preview
        clearImagePreview();
        
        // Load options
        loadCategoryOptions();
        
        // Setup image URL preview
        setupImageUrlPreview();
        
        // Show modal
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
        
        console.log('Product modal opened successfully');
    } catch (error) {
        console.error('Error opening product modal:', error);
        alert('Lỗi khi mở modal sản phẩm: ' + error.message);
    }
}

function editProduct(id) {
    const products = JSON.parse(localStorage.getItem(ADMIN_PRODUCTS_KEY)) || [];
    const product = products.find(p => p.id === id);
    
    if (product) {
        document.getElementById('productModalTitle').innerHTML = '<i class="fas fa-box me-2"></i>Sửa sản phẩm';
        document.getElementById('productId').value = product.id;
        document.getElementById('productTitle').value = product.title;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productDiscountPrice').value = product.discountPercentage || '';
        document.getElementById('productStock').value = product.stock || 0;
        document.getElementById('productBrand').value = product.brand || '';
        document.getElementById('productThumbnail').value = product.thumbnail || '';
        document.getElementById('productDescription').value = product.description || '';
        
        // Show image preview if thumbnail exists
        if (product.thumbnail) {
            const previewImg = document.getElementById('previewImg');
            const imagePreview = document.getElementById('imagePreview');
            if (previewImg && imagePreview) {
                previewImg.src = product.thumbnail;
                imagePreview.style.display = 'block';
            }
        } else {
            clearImagePreview();
        }
        
        loadCategoryOptions();
        setupImageUrlPreview();
        new bootstrap.Modal(document.getElementById('productModal')).show();
    }
}

function loadCategoryOptions() {
    try {
        const categories = JSON.parse(localStorage.getItem(CATEGORIES_KEY)) || [];
        const select = document.getElementById('productCategory');
        
        if (!select) {
            console.error('Product category select not found');
            return;
        }
        
        select.innerHTML = '<option value="">Chọn danh mục</option>';
        categories.forEach(category => {
            select.innerHTML += `<option value="${category.value}">${category.name}</option>`;
        });
        
        // Cũng load brand options
        updateBrandOptions();
        
        console.log(`Loaded ${categories.length} categories`);
    } catch (error) {
        console.error('Error loading category options:', error);
    }
}

function saveProduct() {
    const id = document.getElementById('productId').value;
    const title = document.getElementById('productTitle').value.trim();
    const category = document.getElementById('productCategory').value;
    const price = parseInt(document.getElementById('productPrice').value);
    const discountPrice = parseInt(document.getElementById('productDiscountPrice').value) || null;
    const stock = parseInt(document.getElementById('productStock').value);
    const brand = document.getElementById('productBrand').value.trim();
    const thumbnail = document.getElementById('productThumbnail').value.trim();
    const description = document.getElementById('productDescription').value.trim();
    
    if (!title || !category || !price || stock < 0) {
        alert('Vui lòng nhập đầy đủ thông tin bắt buộc');
        return;
    }
    
    let products = JSON.parse(localStorage.getItem(ADMIN_PRODUCTS_KEY)) || [];
    
    if (id) {
        // Edit existing product
        const index = products.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
            products[index] = {
                ...products[index],
                title: title,
                category: category,
                price: price,
                discountPercentage: discountPrice,
                stock: stock,
                brand: brand,
                thumbnail: thumbnail,
                description: description
            };
        }
    } else {
        // Add new product
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        const newProduct = {
            id: newId,
            title: title,
            category: category,
            price: price,
            discountPercentage: discountPrice,
            stock: stock,
            brand: brand,
            thumbnail: thumbnail || './img/default-product.jpg',
            description: description,
            rating: 0,
            images: [thumbnail || './img/default-product.jpg']
        };
        products.push(newProduct);
    }
    
    localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(products));
    bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
    loadProducts();
    loadDashboardData();
}

function deleteProduct(id) {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
        let products = JSON.parse(localStorage.getItem(ADMIN_PRODUCTS_KEY)) || [];
        products = products.filter(p => p.id !== id);
        localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(products));
        loadProducts();
        loadDashboardData();
    }
}

function handleImageUpload(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        // Kiểm tra loại file
        if (!file.type.startsWith('image/')) {
            alert('Vui lòng chọn file hình ảnh!');
            input.value = '';
            return;
        }
        
        // Kiểm tra kích thước file (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File quá lớn! Vui lòng chọn file nhỏ hơn 5MB.');
            input.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageData = e.target.result;
            
            // Cập nhật URL input
            document.getElementById('productThumbnail').value = imageData;
            
            // Hiển thị preview
            const previewImg = document.getElementById('previewImg');
            const imagePreview = document.getElementById('imagePreview');
            
            if (previewImg && imagePreview) {
                previewImg.src = imageData;
                imagePreview.style.display = 'block';
            }
            
            console.log('Image uploaded successfully:', file.name);
        };
        
        reader.onerror = function() {
            alert('Lỗi khi đọc file hình ảnh!');
            input.value = '';
        };
        
        reader.readAsDataURL(file);
    }
}

// Function to clear image preview
function clearImagePreview() {
    const imagePreview = document.getElementById('imagePreview');
    const productThumbnail = document.getElementById('productThumbnail');
    const productImageFile = document.getElementById('productImageFile');
    
    if (imagePreview) imagePreview.style.display = 'none';
    if (productThumbnail) productThumbnail.value = '';
    if (productImageFile) productImageFile.value = '';
}

// Function to validate image URL
function validateImageUrl(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

// Auto preview when URL is entered
function setupImageUrlPreview() {
    const thumbnailInput = document.getElementById('productThumbnail');
    if (thumbnailInput) {
        thumbnailInput.addEventListener('blur', async function() {
            const url = this.value.trim();
            if (url && url.startsWith('http')) {
                const isValid = await validateImageUrl(url);
                if (isValid) {
                    const previewImg = document.getElementById('previewImg');
                    const imagePreview = document.getElementById('imagePreview');
                    
                    if (previewImg && imagePreview) {
                        previewImg.src = url;
                        imagePreview.style.display = 'block';
                    }
                } else {
                    alert('URL hình ảnh không hợp lệ hoặc không thể tải được!');
                }
            }
        });
    }
}

/***********************
 * ORDERS MANAGEMENT
 ***********************/
function loadOrders() {
    const allOrders = JSON.parse(localStorage.getItem("orders")) || {};
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const tbody = document.getElementById('ordersTable');
    
    tbody.innerHTML = '';
    
    Object.keys(allOrders).forEach(username => {
        const userOrders = allOrders[username] || [];
        
        // Tìm thông tin user thực tế từ danh sách users
        const userInfo = users.find(u => u.username === username);
        const realUserName = userInfo ? userInfo.name : username; // Fallback to username if not found
        
        userOrders.forEach(order => {
            const orderTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const statusClass = order.status === 'completed' ? 'badge-success' : 
                               order.status === 'pending' ? 'badge-warning' : 
                               order.status === 'processing' ? 'badge-info' :
                               order.status === 'shipped' ? 'badge-primary' : 
                               order.status === 'cancelled' ? 'badge-danger' : 'badge-secondary';
            const statusText = order.status === 'completed' ? 'Hoàn thành' : 
                              order.status === 'pending' ? 'Chờ xử lý' : 
                              order.status === 'processing' ? 'Đang xử lý' :
                              order.status === 'shipped' ? 'Đã giao' : 
                              order.status === 'cancelled' ? 'Đã hủy' : 'Không xác định';
            
            // Sử dụng tên thực tế từ đăng ký, fallback to customerName trong order, cuối cùng là username
            const displayName = realUserName || order.customerName || username;
            
            // Kiểm tra có đặt hàng trước không
            const hasPreOrder = order.hasPreOrder || order.items.some(item => item.isPreOrder);
            const preOrderBadge = hasPreOrder ? '<span class="badge bg-warning text-dark ms-1">Đặt trước</span>' : '';
            
            tbody.innerHTML += `
                <tr>
                    <td>${order.id}</td>
                    <td>
                        <div class="d-flex flex-column">
                            <strong>${displayName}</strong>
                            <small class="text-muted">@${username}</small>
                        </div>
                    </td>
                    <td>${new Date(order.date).toLocaleDateString('vi-VN')}</td>
                    <td>${formatVND(orderTotal)}</td>
                    <td>
                        <span class="badge ${statusClass}">${statusText}</span>
                        ${preOrderBadge}
                    </td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-outline-info me-1" onclick="viewOrderDetail('${order.id}', '${username}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-primary" onclick="updateOrderStatus('${order.id}', '${username}')">
                            <i class="fas fa-edit"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    });
}

function viewOrderDetail(orderId, username) {
    const allOrders = JSON.parse(localStorage.getItem("orders")) || {};
    const users = JSON.parse(localStorage.getItem("users")) || [];
    let targetOrder = null;
    let orderUsername = username;
    
    // Tìm order theo ID
    if (username) {
        const userOrders = allOrders[username] || [];
        targetOrder = userOrders.find(order => order.id === orderId);
    } else {
        // Fallback: tìm trong tất cả users
        Object.keys(allOrders).forEach(user => {
            const userOrders = allOrders[user] || [];
            const found = userOrders.find(order => order.id === orderId);
            if (found) {
                targetOrder = found;
                orderUsername = user;
            }
        });
    }
    
    if (targetOrder) {
        const orderTotal = targetOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Tìm thông tin user thực tế
        const userInfo = users.find(u => u.username === orderUsername);
        const realUserName = userInfo ? userInfo.name : orderUsername;
        const displayCustomerName = realUserName || targetOrder.customerName || orderUsername;
        
        let itemsHTML = '';
        targetOrder.items.forEach(item => {
            const preOrderLabel = item.isPreOrder ? ' <span class="badge bg-warning text-dark">Đặt trước</span>' : '';
            itemsHTML += `
                <tr>
                    <td>${item.title}${preOrderLabel}</td>
                    <td>${item.quantity}</td>
                    <td>${formatVND(item.price)}</td>
                    <td>${formatVND(item.price * item.quantity)}</td>
                </tr>
            `;
        });
        
        const statusOptions = [
            { value: 'pending', text: 'Chờ xử lý', class: 'warning' },
            { value: 'processing', text: 'Đang xử lý', class: 'info' },
            { value: 'shipped', text: 'Đã giao', class: 'primary' },
            { value: 'completed', text: 'Hoàn thành', class: 'success' },
            { value: 'cancelled', text: 'Đã hủy', class: 'danger' }
        ];
        
        let statusSelectHTML = '';
        statusOptions.forEach(option => {
            const selected = option.value === targetOrder.status ? 'selected' : '';
            statusSelectHTML += `<option value="${option.value}" ${selected}>${option.text}</option>`;
        });
        
        // Kiểm tra có đặt hàng trước không
        const hasPreOrder = targetOrder.hasPreOrder || targetOrder.items.some(item => item.isPreOrder);
        const preOrderInfo = hasPreOrder && targetOrder.preOrderInfo ? `
            <div class="alert alert-warning mt-3">
                <h6><i class="fas fa-clock me-2"></i>Thông tin đặt hàng trước:</h6>
                <p><strong>Thời gian mong muốn:</strong> ${getExpectedTimeText(targetOrder.preOrderInfo.expectedTime)}</p>
                ${targetOrder.preOrderInfo.notes ? `<p><strong>Ghi chú:</strong> ${targetOrder.preOrderInfo.notes}</p>` : ''}
                <small class="text-muted">
                    <i class="fas fa-info-circle me-1"></i>
                    Đơn hàng có sản phẩm đặt trước. Vui lòng liên hệ khách hàng khi có hàng.
                </small>
            </div>
        ` : '';
        
        document.getElementById('orderDetailContent').innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h6>Thông tin đơn hàng</h6>
                    <p><strong>Mã đơn hàng:</strong> ${targetOrder.id}</p>
                    <p><strong>Khách hàng:</strong> ${displayCustomerName} <small class="text-muted">(@${orderUsername})</small></p>
                    <p><strong>Số điện thoại:</strong> ${targetOrder.customerInfo?.phone || targetOrder.customerPhone || 'N/A'}</p>
                    <p><strong>Email:</strong> ${targetOrder.customerInfo?.email || 'N/A'}</p>
                    <p><strong>Địa chỉ:</strong> ${targetOrder.customerInfo?.address || targetOrder.customerAddress || 'N/A'}</p>
                    ${preOrderInfo}
                </div>
                <div class="col-md-6">
                    <h6>Chi tiết thanh toán</h6>
                    <p><strong>Ngày đặt:</strong> ${new Date(targetOrder.date).toLocaleDateString('vi-VN')}</p>
                    <p><strong>Phương thức:</strong> ${targetOrder.paymentMethod === 'cod' ? 'COD' : 'Chuyển khoản'}</p>
                    <p><strong>Tổng tiền:</strong> ${formatVND(orderTotal)}</p>
                    ${hasPreOrder ? '<p class="text-warning"><i class="fas fa-exclamation-triangle me-1"></i><strong>Có sản phẩm đặt trước</strong></p>' : ''}
                    
                    <div class="mt-3">
                        <label class="form-label"><strong>Trạng thái đơn hàng:</strong></label>
                        <div class="d-flex gap-2">
                            <select class="form-select" id="orderStatus">
                                ${statusSelectHTML}
                            </select>
                            <button class="btn btn-success" onclick="saveOrderStatus('${orderId}', '${orderUsername}')">
                                <i class="fas fa-save me-1"></i>Cập nhật
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <hr>
            <h6>Sản phẩm đã đặt</h6>
            <table class="table table-sm">
                <thead>
                    <tr>
                        <th>Sản phẩm</th>
                        <th>Số lượng</th>
                        <th>Đơn giá</th>
                        <th>Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>
        `;
        
        new bootstrap.Modal(document.getElementById('orderDetailModal')).show();
    }
}

/***********************
 * CUSTOMERS MANAGEMENT
 ***********************/
function loadCustomers() {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const allOrders = JSON.parse(localStorage.getItem("orders")) || {};
    const tbody = document.getElementById('customersTable');
    
    tbody.innerHTML = '';
    
    // Lọc bỏ admin users
    const customers = users.filter(user => 
        user.username !== 'admin' && 
        user.role !== 'admin'
    );
    
    customers.forEach(customer => {
        const userOrders = allOrders[customer.username] || [];
        const totalSpent = userOrders.reduce((sum, order) => {
            const orderTotal = order.items.reduce((orderSum, item) => orderSum + (item.price * item.quantity), 0);
            return sum + orderTotal;
        }, 0);
        
        tbody.innerHTML += `
            <tr>
                <td>${customer.id || 'N/A'}</td>
                <td>${customer.name || customer.username}</td>
                <td>${customer.username}</td>
                <td>${userOrders.length}</td>
                <td>${formatVND(totalSpent)}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-info" onclick="viewCustomerDetail('${customer.username}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

function viewCustomerDetail(username) {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const allOrders = JSON.parse(localStorage.getItem("orders")) || {};
    
    const customer = users.find(u => u.username === username);
    const userOrders = allOrders[username] || [];
    
    if (customer) {
        alert(`Thông tin khách hàng: ${customer.name || customer.username}\nSố đơn hàng: ${userOrders.length}`);
    }
}

/***********************
 * ORDER STATUS MANAGEMENT
 ***********************/
function updateOrderStatus(orderId, username) {
    viewOrderDetail(orderId, username);
}

function saveOrderStatus(orderId, username) {
    const newStatus = document.getElementById('orderStatus').value;
    
    if (!newStatus) {
        alert('Vui lòng chọn trạng thái');
        return;
    }
    
    try {
        // Cập nhật trong orders
        let allOrders = JSON.parse(localStorage.getItem("orders")) || {};
        
        if (allOrders[username]) {
            const orderIndex = allOrders[username].findIndex(order => order.id === orderId);
            if (orderIndex !== -1) {
                const oldStatus = allOrders[username][orderIndex].status;
                allOrders[username][orderIndex].status = newStatus;
                allOrders[username][orderIndex].updatedAt = new Date().toISOString();
                
                // Lưu lại orders
                localStorage.setItem("orders", JSON.stringify(allOrders));
                
                // Đồng bộ với lịch sử mua hàng của user (nếu có)
                syncOrderWithUserHistory(orderId, username, newStatus);
                
                // Đóng modal và refresh
                bootstrap.Modal.getInstance(document.getElementById('orderDetailModal')).hide();
                loadOrders();
                loadDashboardData();
                
                // Thông báo thành công
                showSuccessToast(`Đã cập nhật trạng thái đơn hàng ${orderId} từ "${getStatusText(oldStatus)}" thành "${getStatusText(newStatus)}"`);
                
                console.log(`Order ${orderId} status updated: ${oldStatus} -> ${newStatus}`);
            } else {
                alert('Không tìm thấy đơn hàng để cập nhật');
            }
        } else {
            alert('Không tìm thấy đơn hàng của khách hàng');
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        alert('Lỗi khi cập nhật trạng thái: ' + error.message);
    }
}

function syncOrderWithUserHistory(orderId, username, newStatus) {
    try {
        // Kiểm tra xem có dữ liệu lịch sử mua hàng riêng không
        let userHistory = JSON.parse(localStorage.getItem(`orderHistory_${username}`)) || [];
        
        if (userHistory.length > 0) {
            // Tìm và cập nhật trong lịch sử
            const historyIndex = userHistory.findIndex(order => order.id === orderId);
            if (historyIndex !== -1) {
                userHistory[historyIndex].status = newStatus;
                userHistory[historyIndex].updatedAt = new Date().toISOString();
                localStorage.setItem(`orderHistory_${username}`, JSON.stringify(userHistory));
                console.log(`Synced order ${orderId} status with user history`);
            }
        }
        
        // Trigger event để thông báo cho website (nếu user đang online)
        window.dispatchEvent(new CustomEvent('orderStatusUpdated', {
            detail: {
                orderId: orderId,
                username: username,
                newStatus: newStatus,
                timestamp: new Date().toISOString()
            }
        }));
        
    } catch (error) {
        console.error('Error syncing with user history:', error);
    }
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'Chờ xử lý',
        'processing': 'Đang xử lý',
        'shipped': 'Đã giao',
        'completed': 'Hoàn thành',
        'cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
}

// Bulk update orders status
function bulkUpdateOrderStatus() {
    const selectedOrders = document.querySelectorAll('input[name="orderSelect"]:checked');
    if (selectedOrders.length === 0) {
        alert('Vui lòng chọn ít nhất một đơn hàng');
        return;
    }
    
    const newStatus = prompt('Nhập trạng thái mới (pending/processing/shipped/completed/cancelled):');
    if (!newStatus) return;
    
    const validStatuses = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];
    if (!validStatuses.includes(newStatus)) {
        alert('Trạng thái không hợp lệ');
        return;
    }
    
    if (confirm(`Bạn có chắc muốn cập nhật ${selectedOrders.length} đơn hàng thành "${getStatusText(newStatus)}"?`)) {
        let updatedCount = 0;
        
        selectedOrders.forEach(checkbox => {
            const orderId = checkbox.dataset.orderId;
            const username = checkbox.dataset.username;
            
            try {
                let allOrders = JSON.parse(localStorage.getItem("orders")) || {};
                if (allOrders[username]) {
                    const orderIndex = allOrders[username].findIndex(order => order.id === orderId);
                    if (orderIndex !== -1) {
                        allOrders[username][orderIndex].status = newStatus;
                        allOrders[username][orderIndex].updatedAt = new Date().toISOString();
                        localStorage.setItem("orders", JSON.stringify(allOrders));
                        syncOrderWithUserHistory(orderId, username, newStatus);
                        updatedCount++;
                    }
                }
            } catch (error) {
                console.error(`Error updating order ${orderId}:`, error);
            }
        });
        
        loadOrders();
        loadDashboardData();
        showSuccessToast(`Đã cập nhật thành công ${updatedCount} đơn hàng`);
    }
}

/***********************
 * STATISTICS
 ***********************/
function loadStatistics() {
    loadInventoryStatistics();
    loadTopProducts();
    loadTopCustomers();
    loadRevenueStatistics();
    
    // Create charts for statistics page with a small delay to ensure DOM is ready
    setTimeout(() => {
        createCategoryChart();
        createMonthlyRevenueChart();
    }, 100);
}

/***********************
 * CHART FUNCTIONS
 ***********************/
let revenueChart = null;
let orderStatusChart = null;
let categoryChart = null;
let stockChart = null;
let monthlyRevenueChart = null;

// Function to refresh all charts
function refreshAllCharts() {
    createRevenueChart();
    createOrderStatusChart();
    createCategoryChart();
    createMonthlyRevenueChart();
}

// Function to handle window resize for charts
function handleChartResize() {
    if (revenueChart) revenueChart.resize();
    if (orderStatusChart) orderStatusChart.resize();
    if (categoryChart) categoryChart.resize();
    if (monthlyRevenueChart) monthlyRevenueChart.resize();
}

// Add resize listener
window.addEventListener('resize', handleChartResize);

function createRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (revenueChart) {
        revenueChart.destroy();
    }
    
    // Get revenue data for last 7 days
    const allOrders = JSON.parse(localStorage.getItem("orders")) || {};
    const last7Days = [];
    const revenueData = [];
    
    // Generate last 7 days
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push(date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }));
        
        // Calculate revenue for this day
        let dayRevenue = 0;
        Object.keys(allOrders).forEach(username => {
            const userOrders = allOrders[username] || [];
            userOrders.forEach(order => {
                const orderDate = new Date(order.date);
                if (orderDate.toDateString() === date.toDateString() && order.status === 'completed') {
                    const orderTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                    dayRevenue += orderTotal;
                }
            });
        });
        revenueData.push(dayRevenue);
    }
    
    revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: last7Days,
            datasets: [{
                label: 'Doanh thu (VNĐ)',
                data: revenueData,
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
                        }
                    }
                }
            }
        }
    });
}

function createOrderStatusChart() {
    const ctx = document.getElementById('orderStatusChart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (orderStatusChart) {
        orderStatusChart.destroy();
    }
    
    // Get order status data
    const allOrders = JSON.parse(localStorage.getItem("orders")) || {};
    const statusCount = {
        pending: 0,
        processing: 0,
        shipped: 0,
        completed: 0,
        cancelled: 0
    };
    
    Object.keys(allOrders).forEach(username => {
        const userOrders = allOrders[username] || [];
        userOrders.forEach(order => {
            if (statusCount.hasOwnProperty(order.status)) {
                statusCount[order.status]++;
            }
        });
    });
    
    orderStatusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Chờ xử lý', 'Đang xử lý', 'Đã giao', 'Hoàn thành', 'Đã hủy'],
            datasets: [{
                data: [statusCount.pending, statusCount.processing, statusCount.shipped, statusCount.completed, statusCount.cancelled],
                backgroundColor: [
                    '#ffc107',
                    '#17a2b8',
                    '#6f42c1',
                    '#28a745',
                    '#dc3545'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function createCategoryChart() {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (categoryChart) {
        categoryChart.destroy();
    }
    
    // Get category data
    const products = JSON.parse(localStorage.getItem(ADMIN_PRODUCTS_KEY)) || [];
    const categories = JSON.parse(localStorage.getItem(CATEGORIES_KEY)) || [];
    
    const categoryData = categories.map(category => {
        const count = products.filter(p => p.category === category.value).length;
        return { name: category.name, count: count };
    });
    
    categoryChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categoryData.map(c => c.name),
            datasets: [{
                label: 'Số sản phẩm',
                data: categoryData.map(c => c.count),
                backgroundColor: [
                    '#28a745',
                    '#17a2b8',
                    '#ffc107',
                    '#dc3545',
                    '#6f42c1',
                    '#fd7e14',
                    '#20c997'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function createStockChart() {
    const ctx = document.getElementById('stockChart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (stockChart) {
        stockChart.destroy();
    }
    
    // Get stock data
    const products = JSON.parse(localStorage.getItem(ADMIN_PRODUCTS_KEY)) || [];
    
    const inStock = products.filter(p => p.stock > 5).length;
    const lowStock = products.filter(p => p.stock <= 5 && p.stock > 0).length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    
    stockChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Còn hàng', 'Sắp hết', 'Hết hàng'],
            datasets: [{
                data: [inStock, lowStock, outOfStock],
                backgroundColor: [
                    '#28a745',
                    '#ffc107',
                    '#dc3545'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function createMonthlyRevenueChart() {
    const ctx = document.getElementById('monthlyRevenueChart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (monthlyRevenueChart) {
        monthlyRevenueChart.destroy();
    }
    
    // Get monthly revenue data for last 12 months
    const allOrders = JSON.parse(localStorage.getItem("orders")) || {};
    const monthlyData = [];
    const monthLabels = [];
    
    for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        monthLabels.push(date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }));
        
        let monthRevenue = 0;
        Object.keys(allOrders).forEach(username => {
            const userOrders = allOrders[username] || [];
            userOrders.forEach(order => {
                const orderDate = new Date(order.date);
                if (orderDate.getMonth() === date.getMonth() && 
                    orderDate.getFullYear() === date.getFullYear() && 
                    order.status === 'completed') {
                    const orderTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                    monthRevenue += orderTotal;
                }
            });
        });
        monthlyData.push(monthRevenue);
    }
    
    monthlyRevenueChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: monthLabels,
            datasets: [{
                label: 'Doanh thu (VNĐ)',
                data: monthlyData,
                backgroundColor: 'rgba(40, 167, 69, 0.8)',
                borderColor: '#28a745',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
                        }
                    }
                }
            }
        }
    });
}

function loadInventoryStatistics() {
    const products = JSON.parse(localStorage.getItem(ADMIN_PRODUCTS_KEY)) || [];
    
    let totalProducts = products.length;
    let lowStockProducts = products.filter(p => p.stock <= 5 && p.stock > 0).length;
    let outOfStockProducts = products.filter(p => p.stock === 0).length;
    let totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    
    document.getElementById('inventoryTotalProducts').textContent = totalProducts;
    document.getElementById('inventoryLowStockProducts').textContent = lowStockProducts;
    document.getElementById('inventoryOutOfStockProducts').textContent = outOfStockProducts;
    document.getElementById('inventoryTotalValue').textContent = formatVND(totalValue);
}

function loadTopProducts() {
    const allOrders = JSON.parse(localStorage.getItem("orders")) || {};
    const products = JSON.parse(localStorage.getItem(ADMIN_PRODUCTS_KEY)) || [];
    
    // Count product sales
    const productSales = {};
    
    Object.keys(allOrders).forEach(username => {
        const userOrders = allOrders[username] || [];
        userOrders.forEach(order => {
            if (order.status === 'completed') {
                order.items.forEach(item => {
                    if (!productSales[item.title]) {
                        productSales[item.title] = {
                            title: item.title,
                            quantity: 0,
                            revenue: 0
                        };
                    }
                    productSales[item.title].quantity += item.quantity;
                    productSales[item.title].revenue += item.price * item.quantity;
                });
            }
        });
    });
    
    // Sort by quantity sold
    const topProducts = Object.values(productSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
    
    let html = '';
    if (topProducts.length > 0) {
        topProducts.forEach((product, index) => {
            html += `
                <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div>
                        <strong>${product.title}</strong>
                        <br><small class="text-muted">Đã bán: ${product.quantity} sản phẩm</small>
                    </div>
                    <div class="text-end">
                        <strong>${formatVND(product.revenue)}</strong>
                    </div>
                </div>
            `;
        });
    } else {
        html = '<p class="text-muted">Chưa có dữ liệu bán hàng</p>';
    }
    
    const topProductsElement = document.getElementById('topProducts');
    if (topProductsElement) {
        topProductsElement.innerHTML = html;
    }
}

function loadTopCustomers() {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const allOrders = JSON.parse(localStorage.getItem("orders")) || {};
    
    const customers = users.filter(user => 
        user.username !== 'admin' && 
        user.role !== 'admin'
    );
    
    const customerStats = customers.map(customer => {
        const userOrders = allOrders[customer.username] || [];
        const totalSpent = userOrders.reduce((sum, order) => {
            const orderTotal = order.items.reduce((orderSum, item) => orderSum + (item.price * item.quantity), 0);
            return sum + orderTotal;
        }, 0);
        
        return {
            name: customer.name || customer.username,
            orders: userOrders.length,
            spent: totalSpent
        };
    });
    
    // Sort by total spent
    customerStats.sort((a, b) => b.spent - a.spent);
    
    let html = '';
    customerStats.slice(0, 5).forEach((customer, index) => {
        html += `
            <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                <div>
                    <strong>${customer.name}</strong>
                    <br><small class="text-muted">${customer.orders} đơn hàng</small>
                </div>
                <div class="text-end">
                    <strong>${formatVND(customer.spent)}</strong>
                </div>
            </div>
        `;
    });
    
    document.getElementById('topCustomers').innerHTML = html || '<p class="text-muted">Chưa có khách hàng</p>';
}

function loadRevenueStatistics() {
    const allOrders = JSON.parse(localStorage.getItem("orders")) || {};
    const filter = document.getElementById('revenueFilter')?.value || 'daily';
    
    let currentPeriodRevenue = 0;
    let previousPeriodRevenue = 0;
    
    const now = new Date();
    
    if (filter === 'daily') {
        // Current week vs previous week
        const currentWeekStart = new Date(now);
        currentWeekStart.setDate(now.getDate() - 6);
        
        const previousWeekStart = new Date(currentWeekStart);
        previousWeekStart.setDate(currentWeekStart.getDate() - 7);
        const previousWeekEnd = new Date(currentWeekStart);
        previousWeekEnd.setDate(currentWeekStart.getDate() - 1);
        
        Object.keys(allOrders).forEach(username => {
            const userOrders = allOrders[username] || [];
            userOrders.forEach(order => {
                if (order.status === 'completed') {
                    const orderDate = new Date(order.date);
                    const orderTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                    
                    if (orderDate >= currentWeekStart && orderDate <= now) {
                        currentPeriodRevenue += orderTotal;
                    } else if (orderDate >= previousWeekStart && orderDate <= previousWeekEnd) {
                        previousPeriodRevenue += orderTotal;
                    }
                }
            });
        });
    } else if (filter === 'monthly') {
        // Current month vs previous month
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        
        Object.keys(allOrders).forEach(username => {
            const userOrders = allOrders[username] || [];
            userOrders.forEach(order => {
                if (order.status === 'completed') {
                    const orderDate = new Date(order.date);
                    const orderTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                    
                    if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
                        currentPeriodRevenue += orderTotal;
                    } else if (orderDate.getMonth() === previousMonth && orderDate.getFullYear() === previousYear) {
                        previousPeriodRevenue += orderTotal;
                    }
                }
            });
        });
    }
    
    // Calculate growth percentage
    let growthPercentage = 0;
    if (previousPeriodRevenue > 0) {
        growthPercentage = ((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100;
    } else if (currentPeriodRevenue > 0) {
        growthPercentage = 100;
    }
    
    // Update display
    const currentElement = document.getElementById('currentPeriodRevenue');
    const previousElement = document.getElementById('previousPeriodRevenue');
    const growthElement = document.getElementById('revenueGrowth');
    
    if (currentElement) currentElement.textContent = formatVND(currentPeriodRevenue);
    if (previousElement) previousElement.textContent = formatVND(previousPeriodRevenue);
    if (growthElement) {
        const growthText = growthPercentage >= 0 ? `+${growthPercentage.toFixed(1)}%` : `${growthPercentage.toFixed(1)}%`;
        growthElement.textContent = growthText;
        growthElement.className = growthPercentage >= 0 ? 'text-success' : 'text-danger';
    }
}

function exportStatistics() {
    alert('Chức năng xuất báo cáo đang được phát triển');
}

/***********************
 * NOTIFICATION FUNCTIONS
 ***********************/
// Show success toast notification
function showSuccessToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `
        <div class="alert alert-success alert-dismissible fade show position-fixed" 
             style="top: 20px; right: 20px; z-index: 9999; min-width: 300px;">
            <i class="fas fa-check-circle me-2"></i>
            <strong>Thành công!</strong><br>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 3000);
}

// Show error toast notification
function showErrorToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `
        <div class="alert alert-danger alert-dismissible fade show position-fixed" 
             style="top: 20px; right: 20px; z-index: 9999; min-width: 300px;">
            <i class="fas fa-exclamation-circle me-2"></i>
            <strong>Lỗi!</strong><br>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 4 seconds (longer for error messages)
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 4000);
}

/***********************
 * UTILITY FUNCTIONS
 ***********************/
function formatVND(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

// Hàm đồng bộ danh mục với website
function updateWebsiteCategories() {
    const adminCategories = JSON.parse(localStorage.getItem(CATEGORIES_KEY)) || [];
    
    // Cập nhật cho website categories
    localStorage.setItem('websiteCategories', JSON.stringify(adminCategories));
    
    // Trigger event để website cập nhật dropdown
    window.dispatchEvent(new CustomEvent('categoriesUpdated', { 
        detail: adminCategories 
    }));
    
    console.log('Website categories updated:', adminCategories);
}

/***********************
 * DATA MANAGEMENT
 ***********************/
function resetAdminData() {
    if (confirm('Bạn có chắc muốn reset tất cả dữ liệu admin? Hành động này không thể hoàn tác!')) {
        // Set flag to prevent sample data creation
        localStorage.setItem('preventSampleData', 'true');
        
        // Clear all admin data
        localStorage.removeItem(CATEGORIES_KEY);
        localStorage.removeItem(BRANDS_KEY);
        localStorage.removeItem(ADMIN_PRODUCTS_KEY);
        localStorage.removeItem('websiteCategories');
        
        // Clear website data
        localStorage.removeItem('products');
        localStorage.removeItem('orders');
        localStorage.removeItem('users');
        
        alert('Đã reset tất cả dữ liệu thành công!');
        
        // Reload page
        window.location.reload();
    }
}

function forceImportAllProducts() {
    if (confirm('Bạn có muốn import tất cả sản phẩm từ defaultProducts? Điều này sẽ ghi đè dữ liệu hiện tại.')) {
        try {
            // Get default products from lst-products.js
            let defaultProducts = [];
            
            // Try to get from refreshProducts function if available
            if (typeof refreshProducts === 'function') {
                defaultProducts = refreshProducts();
            } else {
                // Fallback: create some sample products
                defaultProducts = [
                    {
                        id: 1,
                        title: "Gạo hữu cơ ST25",
                        category: "Rice",
                        price: 50000,
                        discountPercentage: 55000,
                        stock: 100,
                        brand: "Star Organic",
                        thumbnail: "./data/products/30/thumbnail.jpg",
                        description: "Gạo hữu cơ chất lượng cao",
                        rating: 4.5,
                        images: ["./data/products/30/thumbnail.jpg"]
                    },
                    {
                        id: 2,
                        title: "Đậu xanh hữu cơ",
                        category: "Pulses",
                        price: 30000,
                        discountPercentage: 35000,
                        stock: 50,
                        brand: "Organic Valley",
                        thumbnail: "./data/products/2/thumbnail.webp",
                        description: "Đậu xanh hữu cơ tự nhiên",
                        rating: 4.0,
                        images: ["./data/products/2/thumbnail.webp"]
                    },
                    {
                        id: 3,
                        title: "Gia vị hữu cơ",
                        category: "Spices and Condiments",
                        price: 25000,
                        discountPercentage: 30000,
                        stock: 75,
                        brand: "Great Value",
                        thumbnail: "./data/products/4/3.jpeg",
                        description: "Gia vị hữu cơ thơm ngon",
                        rating: 4.2,
                        images: ["./data/products/4/3.jpeg"]
                    }
                ];
            }
            
            if (defaultProducts && defaultProducts.length > 0) {
                // Convert to admin format
                const adminProducts = defaultProducts.map(product => ({
                    id: product.id,
                    title: product.title,
                    category: product.category,
                    price: product.price,
                    discountPercentage: product.discountPercentage,
                    stock: product.stock || 10,
                    brand: product.brand || 'Unknown',
                    thumbnail: product.thumbnail,
                    description: product.description,
                    rating: product.rating || 0,
                    images: product.images || [product.thumbnail]
                }));
                
                // Save to admin products
                localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(adminProducts));
                
                // Also save to website products
                localStorage.setItem('products', JSON.stringify(adminProducts));
                
                // Refresh displays
                loadProducts();
                loadDashboardData();
                loadStatistics();
                
                alert(`Đã import thành công ${adminProducts.length} sản phẩm!`);
            } else {
                alert('Không tìm thấy sản phẩm để import!');
            }
        } catch (error) {
            console.error('Error importing products:', error);
            alert('Lỗi khi import sản phẩm: ' + error.message);
        }
    }
}
// Helper function to get expected time text
function getExpectedTimeText(expectedTime) {
    switch(expectedTime) {
        case 'asap': return 'Sớm nhất có thể';
        case '1week': return 'Trong 1 tuần';
        case '2weeks': return 'Trong 2 tuần';
        case '1month': return 'Trong 1 tháng';
        default: return 'Không xác định';
    }
}