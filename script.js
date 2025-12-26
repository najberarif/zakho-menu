const app = {
    // --- State ---
    data: {
        lang: 'en',
        user: null, // 'manager' or null
        categories: [],
        items: [],
        settings: {
            password: 'manager' // Default password
        }
    },

    // --- Initial Data ---
    defaults: {
        categories: [
            { id: 1, name: { en: 'Food', ar: 'طعام', ku: 'خواردن' } },
            { id: 2, name: { en: 'Drinks', ar: 'مشروبات', ku: 'ڤەخواردن' }, },
            { id: 3, name: { en: 'Dessert', ar: 'حلويات', ku: 'شیرینی' } },
            { id: 4, name: { en: 'Special', ar: 'عروض خاصة', ku: 'تایبەتی' } }
        ],
        items: [
            {
                id: 1,
                categoryId: 1,
                price: 6000,
                image: null, // Base64 or null
                status: 'available',
                name: { en: 'Chicken Shawarma', ar: 'شاورما دجاج', ku: 'شاورمای مریشک' },
                desc: { en: 'Tasty chicken with garlic', ar: 'دجاج لذيذ مع ثوم', ku: 'مریشکی بەتام لەگەڵ سیر' }
            },
            {
                id: 2,
                categoryId: 1,
                price: 9000,
                image: null,
                status: 'available',
                name: { en: 'Beef Kebab', ar: 'كباب لحم', ku: 'كبابی گۆشت' },
                desc: { en: 'Grilled beef skewers', ar: 'لحم مشوي', ku: 'گۆشتی برژاو' }
            },
            {
                id: 3,
                categoryId: 2,
                price: 1000,
                image: null,
                status: 'unavailable',
                name: { en: 'Cola', ar: 'كولا', ku: 'کۆلا' },
                desc: { en: 'Cold drink', ar: 'مشروب بارد', ku: 'خواردنەوەی سارد' }
            }
        ]
    },

    // --- Core Functions ---
    init() {
        this.loadData();
        this.renderMenu(); // Initial render
        this.switchLanguage(this.data.lang); // Apply initial lang
        this.setupEventListeners();
        console.log("App Initialized");
    },

    loadData() {
        const stored = localStorage.getItem('restaurantApp');
        if (stored) {
            this.data = JSON.parse(stored);
        } else {
            // Load defaults if fresh
            this.data.categories = this.defaults.categories;
            this.data.items = this.defaults.items;
            this.saveData();
        }
    },

    saveData() {
        try {
            localStorage.setItem('restaurantApp', JSON.stringify(this.data));
        } catch (e) {
            alert('Storage full! Image might be too large.');
        }
    },

    // --- Language System ---
    translations: {
        en: {
            dashboardTitle: 'Manager Dashboard', tabItems: 'Menu Items', tabCategories: 'Categories', tabSettings: 'Settings',
            addNewItem: '+ Add New Item', addNewCategory: '+ Add Category', changePassword: 'Change Password',
            oldPassword: 'Old Password', newPassword: 'New Password', save: 'Save Changes', managerLogin: 'Manager Login', login: 'Login'
        },
        ar: {
            dashboardTitle: 'لوحة التحكم', tabItems: 'الاصناف', tabCategories: 'الأقسام', tabSettings: 'الإعدادات',
            addNewItem: '+ إضافة صنف', addNewCategory: '+ إضافة قسم', changePassword: 'تغيير كلمة المرور',
            oldPassword: 'كلمة المرور القديمة', newPassword: 'كلمة المرور الجديدة', save: 'حفظ التغييرات', managerLogin: 'دخول المدير', login: 'دخول'
        },
        ku: {
             dashboardTitle: 'داشبۆردێ ڕێڤەبەری', 
    tabItems: 'بەرهەم', 
    tabCategories: 'بەش', 
    tabSettings: 'ڕێکخستن',
    addNewItem: '+ زێدەکرنا بەرهەمی', 
    addNewCategory: '+ زێدەکرنا بەشی', 
    changePassword: 'گوهۆڕینا پاسووردی',
    oldPassword: 'پاسووردێ کەڤن', 
    newPassword: 'پاسووردێ نوی', 
    save: 'تۆمارکرن', 
    managerLogin: 'چوونەژوورا ڕێڤەبەری', 
    login: 'چوونەژوور'
        }
    },

    switchLanguage(lang) {
        this.data.lang = lang;
        this.saveData();

        // Update Buttons
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
        document.querySelector(`#lang-btn-${lang}`).classList.add('active');

        // Update Direction
        document.documentElement.dir = (lang === 'ar' || lang === 'ku') ? 'rtl' : 'ltr';

        // Update UI Text
        document.querySelectorAll('[data-key]').forEach(el => {
            const key = el.getAttribute('data-key');
            if (this.translations[lang][key]) {
                el.innerText = this.translations[lang][key];
            }
        });

        this.renderMenu();
        this.renderAdminPanel(); // Re-render admin to update headers
    },

    // --- Public Menu UI ---
    renderMenu() {
        const grid = document.getElementById('menu-grid');
        const tabsContainer = document.getElementById('category-tabs');

        // Render Categories
        tabsContainer.innerHTML = `<button class="cat-tab active" onclick="app.filterMenu('all', this)"> All </button>` +
            this.data.categories.map(c =>
                `<button class="cat-tab" onclick="app.filterMenu(${c.id}, this)">${c.name[this.data.lang]}</button>`
            ).join('');

        // Initial Render All
        this.filterMenu('all', tabsContainer.firstChild);
    },

    filterMenu(catId, btnElement) {
        // Active Tab UI
        document.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
        if (btnElement) btnElement.classList.add('active');

        const grid = document.getElementById('menu-grid');
        grid.innerHTML = '';

        const itemsToShow = (catId === 'all')
            ? this.data.items
            : this.data.items.filter(i => i.categoryId == catId);

        if (itemsToShow.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #9ca3af;">No items found.</div>';
            return;
        }

        itemsToShow.forEach(item => {
            const name = item.name[this.data.lang] || item.name.en;
            const desc = item.desc[this.data.lang] || item.desc.en;
            const price = Number(item.price).toLocaleString() + ' IQD';

            // Image handling
            let imgHtml = item.image
                ? `<img src="${item.image}" class="card-image" alt="${name}">`
                : `<div class="image-placeholder">🍽️</div>`;

            const statusBadge = item.status === 'unavailable'
                ? `<span class="unavailable-badge">Unavailable</span>`
                : '';

            const card = document.createElement('div');
            card.className = 'menu-card';
            card.innerHTML = `
                ${imgHtml}
                <div class="card-content">
                    <div class="card-title">${name}</div>
                    <div class="card-desc">${desc}</div>
                    <div class="card-footer">
                        <span class="card-price">${price}</span>
                        ${statusBadge}
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    },

    // --- Manager Logic ---
    toggleLoginModal() {
        const modal = document.getElementById('login-modal');
        if (this.data.user === 'manager') {
            // Already logged in, switch to dashboard or logout?
            // Actually, if logged in, show dashboard directly
            this.showDashboard();
        } else {
            modal.classList.remove('hidden');
        }
    },

    closeLoginModal() {
        document.getElementById('login-modal').classList.add('hidden');
    },

    loginSubmit() {
        const input = document.getElementById('login-password').value;
        if (input === this.data.settings.password) {
            this.data.user = 'manager';
            this.saveData();
            document.getElementById('login-modal').classList.add('hidden');
            this.showDashboard();
            document.getElementById('login-password').value = '';
        } else {
            alert('Wrong Password!');
        }
    },

    logout() {
        this.data.user = null;
        this.saveData();

        document.getElementById('manager-dashboard').classList.add('hidden');
        document.getElementById('public-menu').classList.remove('hidden');
        document.getElementById('logout-btn').classList.add('hidden');
        document.getElementById('manager-btn').classList.remove('hidden');
    },

    showDashboard() {
        document.getElementById('public-menu').classList.add('hidden');
        document.getElementById('manager-dashboard').classList.remove('hidden');
        document.getElementById('manager-btn').classList.add('hidden');
        document.getElementById('logout-btn').classList.remove('hidden');
        this.renderAdminPanel();
    },

    switchDashboardTab(tabName) {
        document.querySelectorAll('.dashboard-tab-content').forEach(el => el.classList.remove('active'));
        document.getElementById(`tab-${tabName}`).classList.add('active');

        document.querySelectorAll('.dashboard-tabs .tab-btn').forEach(el => el.classList.remove('active'));
        document.querySelector(`.dashboard-tabs button[onclick*="${tabName}"]`).classList.add('active');
    },

    renderAdminPanel() {
        // Render Items Table
        const tbodyItems = document.querySelector('#items-table tbody');
        tbodyItems.innerHTML = this.data.items.map(item => `
            <tr>
                <td>${item.image ? '<img src="' + item.image + '" style="width:40px;height:40px;border-radius:4px;object-fit:cover">' : 'No Img'}</td>
                <td>${item.name.en}</td>
                <td>${Number(item.price).toLocaleString()} IQD</td>
                <td><span style="color: ${item.status === 'available' ? 'var(--primary-color)' : 'var(--danger)'}">${item.status}</span></td>
                <td>
                    <button class="action-btn edit-btn" onclick="app.openItemModal(${item.id})">Edit</button>
                    <button class="action-btn delete-btn" onclick="app.deleteItem(${item.id})">Delete</button>
                </td>
            </tr>
        `).join('');

        // Render Categories Table
        const tbodyCats = document.querySelector('#categories-table tbody');
        tbodyCats.innerHTML = this.data.categories.map(cat => `
            <tr>
                <td>${cat.id}</td>
                <td>${cat.name.en}</td>
                <td>${cat.name.ar}</td>
                <td>${cat.name.ku}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="app.openCategoryModal(${cat.id})">Edit</button>
                    <button class="action-btn delete-btn" onclick="app.deleteCategory(${cat.id})">Delete</button>
                </td>
            </tr>
        `).join('');
    },

    // --- CRUD: Items ---
    openItemModal(id = null) {
        const modal = document.getElementById('item-modal');
        const form = document.getElementById('item-form');
        modal.classList.remove('hidden');

        // Populate Categories
        const catSelect = document.getElementById('item-category');
        catSelect.innerHTML = this.data.categories.map(c => `<option value="${c.id}">${c.name.en}</option>`).join('');

        if (id) {
            // Edit Mode
            const item = this.data.items.find(i => i.id === id);
            document.getElementById('item-modal-title').innerText = 'Edit Item';
            document.getElementById('item-id').value = item.id;
            document.getElementById('item-name-en').value = item.name.en;
            document.getElementById('item-name-ar').value = item.name.ar;
            document.getElementById('item-name-ku').value = item.name.ku;
            document.getElementById('item-desc-en').value = item.desc.en;
            document.getElementById('item-desc-ar').value = item.desc.ar;
            document.getElementById('item-desc-ku').value = item.desc.ku;
            document.getElementById('item-price').value = item.price;
            document.getElementById('item-status').value = item.status;
            document.getElementById('item-category').value = item.categoryId;

            // Image Preview
            const imgPreview = document.getElementById('item-image-preview');
            const placeholder = document.querySelector('.image-preview-box .placeholder');
            if (item.image) {
                imgPreview.src = item.image;
                imgPreview.classList.remove('hidden');
                placeholder.classList.add('hidden');
                document.getElementById('item-image-base64').value = item.image;
            } else {
                imgPreview.classList.add('hidden');
                placeholder.classList.remove('hidden');
                document.getElementById('item-image-base64').value = '';
            }

        } else {
            // Add Mode
            form.reset();
            document.getElementById('item-modal-title').innerText = 'Add New Item';
            document.getElementById('item-id').value = '';
            document.getElementById('item-image-base64').value = '';
            document.getElementById('item-image-preview').classList.add('hidden');
            document.querySelector('.image-preview-box .placeholder').classList.remove('hidden');
        }
    },

    closeItemModal() {
        document.getElementById('item-modal').classList.add('hidden');
    },

    handleImagePreview(input) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById('item-image-preview').src = e.target.result;
                document.getElementById('item-image-preview').classList.remove('hidden');
                document.querySelector('.image-preview-box .placeholder').classList.add('hidden');
                document.getElementById('item-image-base64').value = e.target.result;
            }
            reader.readAsDataURL(input.files[0]);
        }
    },

    saveItem() {
        const id = document.getElementById('item-id').value;
        const newItem = {
            id: id ? parseInt(id) : Date.now(),
            categoryId: document.getElementById('item-category').value,
            price: document.getElementById('item-price').value,
            status: document.getElementById('item-status').value,
            image: document.getElementById('item-image-base64').value || null,
            name: {
                en: document.getElementById('item-name-en').value,
                ar: document.getElementById('item-name-ar').value,
                ku: document.getElementById('item-name-ku').value
            },
            desc: {
                en: document.getElementById('item-desc-en').value,
                ar: document.getElementById('item-desc-ar').value,
                ku: document.getElementById('item-desc-ku').value
            }
        };

        if (id) {
            const index = this.data.items.findIndex(i => i.id == id);
            this.data.items[index] = newItem;
        } else {
            this.data.items.push(newItem);
        }

        this.saveData();
        this.closeItemModal();
        this.renderAdminPanel();
        this.renderMenu(); // Update public view too
    },

    deleteItem(id) {
        if (confirm('Are you sure you want to delete this item?')) {
            this.data.items = this.data.items.filter(i => i.id !== id);
            this.saveData();
            this.renderAdminPanel();
            this.renderMenu();
        }
    },

    // --- CRUD: Categories ---
    openCategoryModal(id = null) {
        const modal = document.getElementById('category-modal');
        const form = document.getElementById('category-form');
        modal.classList.remove('hidden');

        if (id) {
            const cat = this.data.categories.find(c => c.id === id);
            document.getElementById('cat-id').value = cat.id;
            document.getElementById('cat-name-en').value = cat.name.en;
            document.getElementById('cat-name-ar').value = cat.name.ar;
            document.getElementById('cat-name-ku').value = cat.name.ku;
        } else {
            form.reset();
            document.getElementById('cat-id').value = '';
        }
    },

    closeCategoryModal() {
        document.getElementById('category-modal').classList.add('hidden');
    },

    saveCategory() {
        const id = document.getElementById('cat-id').value;
        const newCat = {
            id: id ? parseInt(id) : Date.now(),
            name: {
                en: document.getElementById('cat-name-en').value,
                ar: document.getElementById('cat-name-ar').value,
                ku: document.getElementById('cat-name-ku').value
            }
        };

        if (id) {
            const index = this.data.categories.findIndex(c => c.id == id);
            this.data.categories[index] = newCat;
        } else {
            this.data.categories.push(newCat);
        }

        this.saveData();
        this.closeCategoryModal();
        this.renderAdminPanel();
        this.renderMenu();
    },

    deleteCategory(id) {
        if (confirm('Delete Category? Items in this category might be hidden.')) {
            this.data.categories = this.data.categories.filter(c => c.id !== id);
            this.saveData();
            this.renderAdminPanel();
            this.renderMenu();
        }
    },

    // --- Settings ---
    changePasswordSubmit() {
        const oldPass = document.getElementById('old-password').value;
        const newPass = document.getElementById('new-password').value;

        if (oldPass !== this.data.settings.password) {
            alert('Old Password Incorrect!');
            return;
        }

        if (newPass.length < 4) {
            alert('New Password too short!');
            return;
        }

        this.data.settings.password = newPass;
        this.saveData();
        alert('Password Changed Successfully! Please Login Again.');
        this.logout();
        document.getElementById('old-password').value = '';
        document.getElementById('new-password').value = '';
    },

    setupEventListeners() {
        // Close modals with ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Close modals by clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeAllModals();
                }
            });
        });
    },

    closeAllModals() {
        document.getElementById('login-modal').classList.add('hidden');
        document.getElementById('item-modal').classList.add('hidden');
        document.getElementById('category-modal').classList.add('hidden');
    }
};

// Start App
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
