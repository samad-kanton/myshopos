const acrData = [
    {
        module: "DASHBOARD", 
        rights: `
            <div class="row">
                <div class="cl-3 cm-3 cs-6 cx-6">
                    <div class="checkbox" style="padding: 5px;">
                        <input hidden type="checkbox" name="view_dashboard" id="view_dashboard" class="custom-checkbox" style="padding: 5px;">
                        <label for="view_dashboard" style="cursor: pointer;">&nbsp;View Page</label>
                    </div>
                </div>
                <div class="cl-3 cm-3 cs-6 cx-6">
                    <div class="checkbox" style="padding: 5px;">
                        <input hidden type="checkbox" id="interact_stats" class="custom-checkbox" style="padding: 5px;">
                        <label for="interact_stats" style="cursor: pointer;">&nbsp;Stats Interaction</label>
                    </div>
                </div>
            </div>
        `
    },
    {
        module: "STAFF", 
        rights: `
            <div class="row">
                <div class="cl-3 cm-3 cs-6 cx-6">
                    <div class="checkbox" style="padding: 5px;">
                        <input hidden type="checkbox" id="view_staff" class="custom-checkbox" style="padding: 5px;">
                        <label for="view_staff" style="cursor: pointer;">&nbsp;View Page</label>
                    </div>
                </div>
                <div class="cl-3 cm-3 cs-6 cx-6">
                    <div class="checkbox" style="padding: 5px;">
                        <input hidden type="checkbox" id="create_staff" class="custom-checkbox" style="padding: 5px;">
                        <label for="create_staff" style="cursor: pointer;">&nbsp;Create Staff Bio</label>
                    </div>
                </div>
                <div class="cl-3 cm-3 cs-6 cx-6">
                    <div class="checkbox" style="padding: 5px;">
                        <input hidden type="checkbox" id="update_staff" class="custom-checkbox" style="padding: 5px;">
                        <label for="update_staff" style="cursor: pointer;">&nbsp;Modify Staff Bio</label>
                    </div>
                </div>
                <div class="cl-3 cm-3 cs-6 cx-6">
                    <div class="checkbox" style="padding: 5px;">
                        <input hidden type="checkbox" id="delete_staff" class="custom-checkbox" style="padding: 5px;">
                        <label for="delete_staff" style="cursor: pointer;">&nbsp;Delete Staff</label>
                    </div>
                </div>
            </div>
        `
    },
    {
        module: "CONTACTS", 
        rights: `
            <div class="row">
                <div class="cl-3 cm-3 cs-6 cx-6">
                    <div class="checkbox" style="padding: 5px;">
                        <input hidden type="checkbox" name="view_contacts" id="view_contacts" class="custom-checkbox" style="padding: 5px;">
                        <label for="view_contacts" style="cursor: pointer;">&nbsp;View Page</label>
                    </div>
                </div>
                <div class="cl-3 cm-3 cs-6 cx-6">
                    <div class="checkbox" style="padding: 5px;">
                        <input hidden type="checkbox" id="create_customers" class="custom-checkbox" style="padding: 5px;">
                        <label for="create_customers" style="cursor: pointer;">&nbsp;Create Customers</label>
                    </div>
                </div>
                <div class="cl-3 cm-3 cs-6 cx-6">
                    <div class="checkbox" style="padding: 5px;">
                        <input hidden type="checkbox" id="update_customers" class="custom-checkbox" style="padding: 5px;">
                        <label for="update_customers" style="cursor: pointer;">&nbsp;Update Customers</label>
                    </div>
                </div>
                <div class="cl-3 cm-3 cs-6 cx-6">
                    <div class="checkbox" style="padding: 5px;">
                        <input hidden type="checkbox" id="delete_customers" class="custom-checkbox" style="padding: 5px;">
                        <label for="delete_customers" style="cursor: pointer;">&nbsp;Delete Customers</label>
                    </div>
                </div>
                <div class="cl-3 cm-3 cs-6 cx-6">
                    <div class="checkbox" style="padding: 5px;">
                        <input hidden type="checkbox" id="create_vendors" class="custom-checkbox" style="padding: 5px;">
                        <label for="create_vendors" style="cursor: pointer;">&nbsp;Create Vendors</label>
                    </div>
                </div>
                <div class="cl-3 cm-3 cs-6 cx-6">
                    <div class="checkbox" style="padding: 5px;">
                        <input hidden type="checkbox" id="update_vendors" class="custom-checkbox" style="padding: 5px;">
                        <label for="update_vendors" style="cursor: pointer;">&nbsp;Update Vendors</label>
                    </div>
                </div>
                <div class="cl-3 cm-3 cs-6 cx-6">
                    <div class="checkbox" style="padding: 5px;">
                        <input hidden type="checkbox" id="delete_vendors" class="custom-checkbox" style="padding: 5px;">
                        <label for="delete_vendors" style="cursor: pointer;">&nbsp;Delete Vendors</label>
                    </div>
                </div>
            </div>
        `
    },
    {
        module: "STOCK", 
        rights: `
            <div class="row">
                <div class="cl-3 cm-3 cs-6 cx-6">
                    <div class="checkbox" style="padding: 5px;">
                        <input hidden type="checkbox" id="view_stock" class="custom-checkbox" style="padding: 5px;">
                        <label for="view_stock" style="cursor: pointer;">&nbsp;View Page</label>
                    </div>
                </div>
                <div class="cl-3 cm-3 cs-6 cx-6">
                    <div class="checkbox" style="padding: 5px;">
                        <input hidden type="checkbox" id="create_stock" class="custom-checkbox" style="padding: 5px;">
                        <label for="create_stock" style="cursor: pointer;">&nbsp;Create Stock</label>
                    </div>
                </div>
                <div class="cl-3 cm-3 cs-6 cx-6">
                    <div class="checkbox" style="padding: 5px;">
                        <input hidden type="checkbox" id="update_stock" class="custom-checkbox" style="padding: 5px;">
                        <label for="update_stock" style="cursor: pointer;">&nbsp;Update Stock</label>
                    </div>
                </div>
                <div class="cl-3 cm-3 cs-6 cx-6">
                    <div class="checkbox" style="padding: 5px;">
                        <input hidden type="checkbox" id="delete_stock" class="custom-checkbox" style="padding: 5px;">
                        <label for="delete_stock" style="cursor: pointer;">&nbsp;Delete Stock</label>
                    </div>
                </div>
                <div class="cl-3 cm-3 cs-6 cx-6">
                    <div class="checkbox" style="padding: 5px;">
                        <input hidden type="checkbox" id="restocking" class="custom-checkbox" style="padding: 5px;">
                        <label for="restocking" style="cursor: pointer;">&nbsp;Re-Stocking</label>
                    </div>
                </div>
                <div class="cl-3 cm-3 cs-6 cx-6">
                    <div class="checkbox" style="padding: 5px;">
                        <input hidden type="checkbox" id="manage_categories" class="custom-checkbox" style="padding: 5px;">
                        <label for="manage_categories" style="cursor: pointer;">&nbsp;Manage Categories</label>
                    </div>
                </div>
            </div>
        `
    },
    {
        module: "POS", 
        rights: `
            <div class="row">
                <div class="cl-3 cm-4 cs-6 cx-6">
                    <div class="checkbox" style="padding: 5px;">
                        <input hidden type="checkbox" id="view_pos" class="custom-checkbox" style="padding: 5px;">
                        <label for="view_pos" style="cursor: pointer;">&nbsp;View Page</label>
                    </div>
                </div>
                <div class="cl-3 cm-4 cs-6 cx-6">
                    <div class="checkbox" style="padding: 5px;">
                        <input hidden type="checkbox" id="set_salesDate" class="custom-checkbox" style="padding: 5px;">
                        <label for="set_salesDate" style="cursor: pointer;">&nbsp;Set Sales Date</label>
                    </div>
                </div>
                <div class="cl-3 cm-4 cs-6 cx-6">
                    <div class="checkbox" style="padding: 5px;">
                        <input hidden type="checkbox" id="filter_stock" class="custom-checkbox" style="padding: 5px;">
                        <label for="filter_stock" style="cursor: pointer;">&nbsp;Filter Stock</label>
                    </div>
                </div>
                <div class="cl-3 cm-4 cs-6 cx-6">
                    <div class="checkbox" style="padding: 5px;">
                        <input hidden type="checkbox" id="see_stockLevels" class="custom-checkbox" style="padding: 5px;">
                        <label for="see_stockLevels" style="cursor: pointer;">&nbsp;See Stock Levels</label>
                    </div>
                </div>
                <div class="cl-3 cm-4 cs-6 cx-6">
                    <div class="checkbox" style="padding: 5px;">
                        <input hidden type="checkbox" id="process_sales" class="custom-checkbox" style="padding: 5px;">
                        <label for="process_sales" style="cursor: pointer;">&nbsp;Process Sales</label>
                    </div>
                </div>
                <div class="cl-3 cm-4 cs-6 cx-6">
                    <div class="checkbox" style="padding: 5px;">
                        <input hidden type="checkbox" id="preview_sales" class="custom-checkbox" style="padding: 5px;">
                        <label for="preview_sales" style="cursor: pointer;">&nbsp;Preview Sales</label>
                    </div>
                </div>
                <div class="cl-3 cm-4 cs-6 cx-6">
                    <div class="checkbox" style="padding: 5px;">
                        <input hidden type="checkbox" id="preview_session_sales" class="custom-checkbox" style="padding: 5px;">
                        <label for="preview_session_sales" style="cursor: pointer;">&nbsp;Preview Session Sales</label>
                    </div>
                </div>
                <div class="cl-3 cm-4 cs-6 cx-6">
                    <div class="checkbox" style="padding: 5px;">
                        <input hidden type="checkbox" id="sales_return" class="custom-checkbox" style="padding: 5px;">
                        <label for="sales_return" style="cursor: pointer;">&nbsp;Sales Reversal</label>
                    </div>
                </div>
                <div class="cl-3 cm-4 cs-6 cx-6">
                    <div class="checkbox" style="padding: 5px;">
                        <input hidden type="checkbox" id="bill_customer" class="custom-checkbox" style="padding: 5px;">
                        <label for="bill_customer" style="cursor: pointer;">&nbsp;Bill Customer</label>
                    </div>
                </div>
                <div class="cl-3 cm-4 cs-6 cx-6">
                    <div class="checkbox" style="padding: 5px;">
                        <input hidden type="checkbox" id="apply_tax" class="custom-checkbox" style="padding: 5px;">
                        <label for="apply_tax" style="cursor: pointer;">&nbsp;Apply Tax</label>
                    </div>
                </div>
                <div class="cl-3 cm-4 cs-6 cx-6">
                    <div class="checkbox" style="padding: 5px;">
                        <input hidden type="checkbox" id="apply_discounts" class="custom-checkbox" style="padding: 5px;">
                        <label for="apply_discounts" style="cursor: pointer;">&nbsp;Apply Discounts</label>
                    </div>
                </div>
            </div>
        `
    },
    {
        module: "FINANCE", 
        rights: `
            <div class="row">
                <div class="cl-3 cm-3 cs-6 cx-6">
                    <div class="checkbox" style="padding: 5px;">
                        <input hidden type="checkbox" id="view_finance" class="custom-checkbox" style="padding: 5px;">
                        <label for="view_finance" style="cursor: pointer;">&nbsp;View Page</label>
                    </div>
                </div>
                <div class="cl-3 cm-3 cs-6 cx-6">
                    <div class="checkbox" style="padding: 5px;">
                        <input hidden type="checkbox" id="create_stock" class="custom-checkbox" style="padding: 5px;">
                        <label for="create_stock" style="cursor: pointer;">&nbsp;Create Stock</label>
                    </div>
                </div>
                <div class="cl-3 cm-3 cs-6 cx-6">
                    <div class="checkbox" style="padding: 5px;">
                        <input hidden type="checkbox" id="update_stock" class="custom-checkbox" style="padding: 5px;">
                        <label for="update_stock" style="cursor: pointer;">&nbsp;Update Stock</label>
                    </div>
                </div>
                <div class="cl-3 cm-3 cs-6 cx-6">
                    <div class="checkbox" style="padding: 5px;">
                        <input hidden type="checkbox" id="delete_stock" class="custom-checkbox" style="padding: 5px;">
                        <label for="delete_stock" style="cursor: pointer;">&nbsp;Delete Stock</label>
                    </div>
                </div>
            </div>
        `
    },
    {
        module: "REPORT", 
        rights: `
            <div class="row">
                <div class="cl-3 cm-4 cs-6 cx-6">
                    <div class="checkbox" style="padding: 5px;">
                        <input hidden type="checkbox" id="view_report" class="custom-checkbox" style="padding: 5px;">
                        <label for="view_report" style="cursor: pointer;">&nbsp;View Page</label>
                    </div>
                </div>
                <div class="cl-3 cm-4 cs-6 cx-6">
                    <div class="checkbox" style="padding: 5px;">
                        <input hidden type="checkbox" id="see_inventory" class="custom-checkbox" style="padding: 5px;">
                        <label for="see_inventory" style="cursor: pointer;">&nbsp;See Stocks</label>
                    </div>
                </div>
                <div class="cl-3 cm-4 cs-6 cx-6">
                    <div class="checkbox" style="padding: 5px;">
                        <input hidden type="checkbox" id="see_sales" class="custom-checkbox" style="padding: 5px;">
                        <label for="see_sales" style="cursor: pointer;">&nbsp;See Sales</label>
                    </div>
                </div>
                <div class="cl-3 cm-4 cs-6 cx-6">
                    <div class="checkbox" style="padding: 5px;">
                        <input hidden type="checkbox" id="see_purchases" class="custom-checkbox" style="padding: 5px;">
                        <label for="see_purchases" style="cursor: pointer;">&nbsp;See Purchases</label>
                    </div>
                </div>
                <div class="cl-3 cm-4 cs-6 cx-6">
                    <div class="checkbox" style="padding: 5px;">
                        <input hidden type="checkbox" id="see_staffData" class="custom-checkbox" style="padding: 5px;">
                        <label for="see_staffData" style="cursor: pointer;">&nbsp;See Staff</label>
                    </div>
                </div>
                <div class="cl-3 cm-4 cs-6 cx-6">
                    <div class="checkbox" style="padding: 5px;">
                        <input hidden type="checkbox" id="see_finances" class="custom-checkbox" style="padding: 5px;">
                        <label for="see_finances" style="cursor: pointer;">&nbsp;See Finances</label>
                    </div>
                </div>
                <div class="cl-3 cm-4 cs-6 cx-6">
                    <div class="checkbox" style="padding: 5px;">
                        <input hidden type="checkbox" id="see_customers" class="custom-checkbox" style="padding: 5px;">
                        <label for="see_customers" style="cursor: pointer;">&nbsp;See Customers</label>
                    </div>
                </div>
                <div class="cl-3 cm-4 cs-6 cx-6">
                    <div class="checkbox" style="padding: 5px;">
                        <input hidden type="checkbox" id="see_vendors" class="custom-checkbox" style="padding: 5px;">
                        <label for="see_vendors" style="cursor: pointer;">&nbsp;See Vendors</label>
                    </div>
                </div>
            </div>
        `
    },
    {
        module: "CONFIG", 
        rights: `
            <div class="row">
                <div class="cl-3 cm-4 cs-6 cx-6">
                    <div class="checkbox" style="padding: 5px;">
                        <input hidden type="checkbox" id="view_config" class="custom-checkbox" style="padding: 5px;">
                        <label for="view_config" style="cursor: pointer;">&nbsp;View Page</label>
                    </div>
                </div>
                <div class="cl-3 cm-4 cs-6 cx-6">
                    <div class="checkbox" style="padding: 5px;">
                        <input hidden type="checkbox" id="manage_company" class="custom-checkbox" style="padding: 5px;">
                        <label for="manage_company" style="cursor: pointer;">&nbsp;Company Profile</label>
                    </div>
                </div>
                <div class="cl-3 cm-4 cs-6 cx-6">
                    <div class="checkbox" style="padding: 5px;">
                        <input hidden type="checkbox" id="view_preferences" class="custom-checkbox" style="padding: 5px;">
                        <label for="view_preferences" style="cursor: pointer;">&nbsp;Set Preferences</label>
                    </div>
                </div>
            </div>
        `
    }
];

export default acrData;