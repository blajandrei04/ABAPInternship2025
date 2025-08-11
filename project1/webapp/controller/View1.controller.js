sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, MessageToast, MessageBox, History, JSONModel, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("project1.controller.View1", {

        onInit: function () {
            var oModel = new JSONModel();
            this._oModel = this.getOwnerComponent().getModel();

            // Load local test data (optional for dev)
            oModel.loadData("./model/test_data.json", null, true);

            oModel.attachRequestCompleted(function () {
                console.log("Local test data loaded:", oModel.getData());
            });

            oModel.attachRequestFailed(function () {
                console.error("Error loading test_data.json.");
            });

            this.getView().setModel(oModel, "resume");
        },

        onForgotPasswordPress: function () {
            var that = this;
            if (!this.oDialog) {
                this.loadFragment({
                    name: "project1.view.ForgotPass"
                }).then(function (oDialog) {
                    that.oDialog = oDialog;
                    that.oDialog.open();
                });
            } else {
                this.oDialog.open();
            }
        },

        onCloseDialog: function () {
            if (this.oDialog) {
                this.oDialog.close();
            }
        },

        onRegisterPress: function () {
            this.getRouter().navTo("RouteRegister");
        },

        onConfirmForgotPassword: function () {
            this.onCloseDialog();
        },

        getRouter: function () {
            return sap.ui.core.UIComponent.getRouterFor(this);
        },

        onLoginPress: function () {
            const oView = this.getView();
            const sEmail = oView.byId("usernameInput").getValue().trim();
            const sPassword = oView.byId("passwordInput").getValue().trim();

            if (!sEmail || !sPassword) {
                MessageBox.error("Please fill in both fields.");
                return;
            }

            const oODataModel = this.getOwnerComponent().getModel();
            const maxUserId = 50;

            let usersFound = [];
            let requestsCompleted = 0;
            let loginDone = false;

            const checkAllDone = () => {
                if (loginDone) return;

                if (requestsCompleted === maxUserId + 1) {
                    const foundUser = usersFound.find(user =>
                        user.USER_EMAIL && user.USER_EMAIL.trim().toLowerCase() === sEmail.toLowerCase()
                    );

                    if (!foundUser) {
                        MessageBox.error("User not found with email: " + sEmail);
                        loginDone = true;
                        return;
                    }

                    if (foundUser.USER_PASSWORD && foundUser.USER_PASSWORD.trim() === sPassword) {
                        const oUserModel = new JSONModel({
                            userId: foundUser.USER_ID,
                            userName: foundUser.USER_NAME,
                            userEmail: foundUser.USER_EMAIL,
                            isLoggedIn: true
                        });
                        this.getOwnerComponent().setModel(oUserModel, "currentUser");

                        MessageToast.show("Welcome " + foundUser.USER_NAME);

                        oView.byId("usernameInput").setValue("");
                        oView.byId("passwordInput").setValue("");

                        this.getRouter().navTo("RouteHomePage");
                    } else {
                        MessageBox.error("Invalid password for " + sEmail);
                    }
                    loginDone = true;
                }
            };

            for (let id = 0; id <= maxUserId; id++) {
                const formattedId = id.toString().padStart(5, '0');

                oODataModel.read(`/UserSet('${formattedId}')`, {
                    success: (oData) => {
                        if (oData && oData.USER_EMAIL) {
                            usersFound.push(oData);
                        }
                        requestsCompleted++;
                        checkAllDone();
                    },
                    error: () => {
                        requestsCompleted++;
                        checkAllDone();
                    }
                });
            }
        }
    });
});
