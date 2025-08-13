sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel"
], (Controller, MessageToast, MessageBox, History, JSONModel) => {
    "use strict";
            const oViewModel = new JSONModel({
                email: "",
                password: "",
                confirmPassword: ""
            });
            this.getView().setModel(oViewModel, "registerModel");
        },
        onSubmit() {
            const oView = this.getView();
            const oViewModel = oView.getModel("registerModel");
            const oRegisterData = oViewModel.getData();
            const oRouter = this.getRouter();
            const oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            const oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

            // 1. --- Client-Side Validation ---
            if (!oRegisterData.email || !oRegisterData.password || !oRegisterData.confirmPassword) {
                MessageBox.error(oBundle.getText("errorMsg")); // "Please fill all fields"
                return;
            }

            if (oRegisterData.password !== oRegisterData.confirmPassword) {
                MessageBox.error(oBundle.getText("passwordMismatchError")); // "Passwords do not match."
                return;
            }

            // A simple regex for email validation
            const oEmailRegex = /^\S+@\S+\.\S+$/;
            if (!oEmailRegex.test(oRegisterData.email)) {
                MessageBox.error(oBundle.getText("invalidEmailError")); // "Please enter a valid email address."
                return;
            }

            // 2. --- Backend Call ---
            const oODataModel = this.getOwnerComponent().getModel();
            oView.setBusy(true);

            // NOTE: Based on your service metadata, the function is 'RegisterUser'
            // and the parameters are 'Email', 'Password', and 'ConfirmPassword'.
            oODataModel.callFunction("/RegisterUser", {
                method: "POST",
                urlParameters: {
                    Email: oRegisterData.email,
                    Password: oRegisterData.password,
                    ConfirmPassword: oRegisterData.confirmPassword
                },
                success: () => {
                    oView.setBusy(false);
                    MessageBox.success(oBundle.getText("registerSuccess"), {
                        onClose: () => {
                            oViewModel.setData({ email: "", password: "", confirmPassword: "" }); // Clear form
                            oRouter.navTo("RouteView1");
                        }
                    });
                },
                error: (oError) => {
                    oView.setBusy(false);
                    let sErrorMessage = oBundle.getText("registerGenericError"); // "Registration failed. Please try again."
                    try {
                        const oErrorResponse = JSON.parse(oError.responseText);
                        sErrorMessage = oErrorResponse?.error?.message?.value || sErrorMessage;
                    } catch (e) {
                        // Ignore parsing error
                    }
                    MessageBox.error(sErrorMessage);
            const sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getRouter().navTo("RouteView1", {}, true /*no history*/);
            }
        },
    });
});