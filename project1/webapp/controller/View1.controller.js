sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, MessageBox, History, JSONModel) {
    "use strict";

    return Controller.extend("project1.controller.View1", {

        onInit: function () {
            var oModel = new JSONModel();
            this._oModel = this.getOwnerComponent().getModel();

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

        getRouter: function () {
            return sap.ui.core.UIComponent.getRouterFor(this);
        },

        onLoginPress: function () {
            const oView = this.getView();
            let sEmail = oView.byId("usernameInput").getValue().trim();
            let sPassword = oView.byId("passwordInput").getValue().trim();

            if (!sEmail || !sPassword) {
                MessageBox.error("Please fill in both fields.");
                return;
            }
            if (!sEmail.includes("@") || !sEmail.includes(".")) {
                MessageBox.error("Please enter a valid email address.");
                return;
            }
            sEmail = sEmail.toUpperCase();
            sPassword = sPassword.toUpperCase();

            const oODataModel = this.getOwnerComponent().getModel();

            oODataModel.callFunction("/CheckUserLogin", {
                method: "GET",
                urlParameters: {
                    EMAIL: sEmail,
                    PASSWORD: sPassword,
                    SU: false
                },
                success: (oData) => {
                    if (oData && oData.EMAIL) {
                        const oUserModel = new JSONModel({
                            USER_EMAIL: oData.EMAIL,
                            PASSWORD: oData.PASSWORD,
                            SU: oData.SU || "X",
                            isLoggedIn: true
                        });
                        this.getOwnerComponent().setModel(oUserModel, "user");

                        console.log("User model content after login:", oUserModel.getData());

                        oODataModel.read("/EMPLOYEESet", {
                            filters: [
                                new sap.ui.model.Filter("EMAIL", sap.ui.model.FilterOperator.EQ, sEmail)
                            ],
                            success: (oResult) => {
                                if (oResult && oResult.results && oResult.results.length > 0) {
                                    const empId = oResult.results[0].EMP_ID;
                                    console.log("EMP_ID gasit:", empId);

                                    const sPath = `/EMPLOYEESet(EMP_ID='${empId}',EMAIL='${sEmail}')`;
                                    oODataModel.read(sPath, {
                                        success: (oProfileData) => {
                                            console.log("Profil corect gasit:", oProfileData);

                                            oUserModel.setData({
                                                ...oUserModel.getData(),
                                                ...oProfileData
                                            });

                                            MessageToast.show(
                                                "Welcome " + oProfileData.FIRST_NAME + " " + oProfileData.LAST_NAME + "!"
                                            );

                                            oView.byId("usernameInput").setValue("");
                                            oView.byId("passwordInput").setValue("");

                                            if (oProfileData.SU === "TRUE") {
                                                this.getRouter().navTo("RouteManagerPage");
                                            } else {
                                                this.getRouter().navTo("RouteHomePage");
                                            }
                                        },
                                        error: (oErr) => {
                                            console.error("Nu am putut citi profilul:", oErr);
                                            MessageBox.error("Failed to load user profile.");
                                        }
                                    });
                                } else {
                                    console.error("Nu am gasit EMP_ID pentru emailul dat.");
                                    MessageBox.error("User profile not found.");
                                }
                            },
                            error: (oErr) => {
                                console.error("Eroare la cautarea EMP_ID:", oErr);
                                MessageBox.error("Error searching for user profile.");
                            }
                        });
                    } else {
                        MessageBox.error("Invalid login credentials.");
                    }
                },
                error: (oError) => {
                    console.error("Login failed:", oError);
                    MessageBox.error("Login failed. Please try again.");
                }
            });
        }
        ,

        onConfirmForgotPassword: function () {
            let sEmail = this.byId("forgotEmailInput").getValue().trim();
            let sPassword = this.byId("forgotEmailInput1").getValue().trim();
            const sConfirmationPassword = this.byId("forgotEmailInput12").getValue().trim();

            if (!sEmail || !sPassword || !sConfirmationPassword) {
                MessageBox.error("Please fill in all fields.");
                return;
            }
            if (sPassword !== sConfirmationPassword) {
                MessageBox.error("Passwords do not match.");
                return;
            }
            if (!sEmail.includes("@") || !sEmail.includes(".")) {
                MessageBox.error("Please enter a valid email address.");
                return;
            }
            sEmail = sEmail.toUpperCase();
            sPassword = sPassword.toUpperCase();
            sConfirmationPassword = sConfirmationPassword.toUpperCase();

            const oODataModel = this.getView().getModel();

            oODataModel.callFunction("/ForgotPassword", {
                method: "POST",
                urlParameters: {
                    EMAIL: sEmail,
                    PASSWORD: sPassword,
                    PASSWORD1: sConfirmationPassword
                },
                success: (oData) => {
                    MessageToast.show("Password changed successfully!");
                    this.onCloseDialog();
                },
                error: (oError) => {
                    console.error("Forgot Password failed:", oError);
                    MessageBox.error("Failed to change password. Please try again.");
                }
            });
        }
    });
});