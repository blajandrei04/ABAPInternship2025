sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/format/DateFormat"
], (Controller, MessageToast, MessageBox, History, JSONModel, Filter, FilterOperator, DateFormat) => {
    "use strict";

    return Controller.extend("project1.controller.HomePage", {
        _oPegDialog: null,
        _oChangePassDialog: null,

        onInit() {
            console.log("HomePage Controller initialized");
            this.getRouter()
                .getRoute("RouteHomePage")
                .attachPatternMatched(this._onObjectMatched, this);

            const oLocalDataModel = new JSONModel({
                PegStatus: [
                    { key: "PENDING", text: "Pending" },
                    { key: "COMPLETED", text: "Completed" },
                ],
                FbStatus: [
                    { key: "PENDING", text: "Pending" },
                    { key: "COMPLETED", text: "Completed" }
                ]
            });
            this.getView().setModel(oLocalDataModel, "localData");

            const oViewModel = new JSONModel({
                selectedTabKey: "Info",
                fbVisible: false,
                selectedFeedback: null
            });
            this.getView().setModel(oViewModel, "view");
        },

        formatter: {
            formatDate: function (oDate) {
                if (oDate) {
                    const oDateFormat = DateFormat.getDateTimeInstance({
                        pattern: "dd.MM.yyyy HH:mm"
                    });
                    return oDateFormat.format(new Date(oDate));
                }
                return "";
            }
        },

        _getEmployeeNameMap: function () {
            return new Promise((resolve, reject) => {
                const oODataModel = this.getOwnerComponent().getModel();
                oODataModel.read("/EMPLOYEESet", {
                    success: (oData) => {
                        const oNameMap = {};
                        if (oData && oData.results) {
                            oData.results.forEach(item => {
                                oNameMap[item.EMP_ID] = item.FULL_NAME;
                            });
                        }
                        resolve(oNameMap);
                    },
                    error: (oError) => {
                        reject(oError);
                    }
                });
            });
        },

        // UPDATED: Fetches project names from the ProjectSet entity
        _getProjectNameMap: function () {
            return new Promise((resolve, reject) => {
                const oODataModel = this.getOwnerComponent().getModel();
                oODataModel.read("/ProjectSet", {
                    success: (oData) => {
                        const oProjectMap = {};
                        if (oData && oData.results) {
                            oData.results.forEach(item => {
                                if (item.PROJECT_ID && item.PROJECT_NAME) {
                                    oProjectMap[item.PROJECT_ID] = item.PROJECT_NAME;
                                }
                            });
                        }
                        resolve(oProjectMap);
                    },
                    error: (oError) => {
                        console.error("Failed to read from ProjectSet:", oError);
                        reject(oError);
                    }
                });
            });
        },

        _onObjectMatched() {
            const oUserModel = this.getOwnerComponent().getModel("user");

            if (!oUserModel || !oUserModel.getProperty("/isLoggedIn")) {
                console.warn("User not logged in yet. Redirecting to login.");
                this.getRouter().navTo("RouteView1");
                return;
            }

            const sLoggedInUserEmail = oUserModel.getProperty("/USER_EMAIL");
            console.log("[DEBUG] Logged-in user email:", sLoggedInUserEmail);

            const oODataModel = this.getOwnerComponent().getModel();

            this._getEmployeeNameMap().then(oNameMap => {
                console.log("[DEBUG] Fetching team data for user:", sLoggedInUserEmail);
                oODataModel.callFunction("/ViewTeamFI", {
                    method: "GET",
                    urlParameters: {
                        USER_EMAIL: sLoggedInUserEmail
                    },
                    success: (oData) => {
                        console.log("[DEBUG] Team data fetched successfully:", oData);
                        if (oData && oData.results) {
                            const aTeamData = oData.results.map(item => ({
                                ...item,
                                FULL_NAME: oNameMap[item.EMP_ID] || item.EMP_ID
                            }));
                            const oTeamModel = new JSONModel({ MyTeam: aTeamData });
                            this.getView().setModel(oTeamModel, "team");
                            console.log("[DEBUG] Team model populated:", oTeamModel.getData());
                        } else {
                            console.warn("[DEBUG] No team data received.");
                            this.getView().setModel(new JSONModel({ MyTeam: [] }), "team");
                        }
                    },
                    error: (oError) => {
                        console.error("[DEBUG] Error fetching team data:", oError);
                        MessageBox.error("Failed to load team data. Please try again.");
                    }
                });
            }).catch(() => {
                MessageBox.error("Failed to load employee names.");
            });
        },

        getRouter() {
            return sap.ui.core.UIComponent.getRouterFor(this);
        },

        onNavBack: function () {
            var oHistory, sPreviousHash;
            oHistory = History.getInstance();
            sPreviousHash = oHistory.getPreviousHash();
            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getRouter().navTo("RouteView1", {}, true);
            }
        },

        onGiveFeedback() {
            this.getRouter().navTo("RouteFeedbackPage");
        },

        onOpenManager() {
            this.getRouter().navTo("RouteManagerPage");
        },

        async onRequestPeg() {
            if (!this._oPegDialog) {
                this._oPegDialog = await this.loadFragment({
                    name: "project1.view.PegDialog",
                    controller: this
                });
                this.getView().addDependent(this._oPegDialog);
            }

            const oODataModel = this.getOwnerComponent().getModel();
            
            // Get managers and projects from their respective entity sets
            Promise.all([
                new Promise((resolve, reject) => {
                    oODataModel.read("/EMPLOYEESet", {
                        success: (oData) => {
                            const aManagers = (oData && oData.results) ? oData.results.filter(item => item.SU && String(item.SU).toUpperCase() === 'TRUE') : [];
                            this.getView().setModel(new JSONModel({ Managers: aManagers }), "managers");
                            resolve();
                        },
                        error: (oError) => reject(oError)
                    });
                }),
                new Promise((resolve, reject) => {
                    oODataModel.read("/ProjectSet", {
                        success: (oData) => {
                            const aProjectData = (oData && oData.results) ? oData.results : [];
                            this.getView().setModel(new JSONModel({ Projects: aProjectData }), "projects");
                            resolve();
                        },
                        error: (oError) => reject(oError)
                    });
                })
            ]).then(() => {
                this._oPegDialog.open();
            }).catch(() => {
                MessageBox.error("Failed to load project and manager lists.");
            });
        },

        onSendPegRequest: function () {
            if (!this._oPegDialog) {
                MessageBox.error("The PEG request dialog is not available.");
                return;
            }
            const oProjectComboBox = this.getView().byId("projectComboBox");
            const oManagerComboBox = this.getView().byId("managerComboBox");
            const sProjectId = oProjectComboBox.getSelectedKey();
            const sManagerEmail = oManagerComboBox.getSelectedKey();
            const oUserModel = this.getOwnerComponent().getModel("user");
            const sLoggedInUserEmail = oUserModel.getProperty("/USER_EMAIL");

            if (!sProjectId || !sManagerEmail) {
                MessageBox.error("Please select a project and a manager.");
                return;
            }

            // Get the project name from the selected item
            const oSelectedProjectItem = oProjectComboBox.getSelectedItem();
            const sProjectName = oSelectedProjectItem ? oSelectedProjectItem.getText() : sProjectId;

            const oODataModel = this.getOwnerComponent().getModel();
            oODataModel.callFunction("/New_360", {
                method: "POST",
                urlParameters: {
                    EMAIL: sLoggedInUserEmail,
                    PROJECT_ID: sProjectId,
                    PROJECT_NAME: sProjectName,
                    ANONYMITY: 'FALSE', // Default value
                    // The rest of the parameters seem to be for a different purpose or are missing from the form
                    // You'll need to populate these based on your UI
                    RECEIVER_NAME: sManagerEmail,
                    CATEGORY_COMMENT: "Initial comment",
                    CATEGORY_RATING: 5,
                    CATEGORY_NAME: "Default"
                },
                success: (oData) => {
                    MessageToast.show("360 feedback request sent successfully!");
                    this.onClosePegDialog();
                    this.onTabSelect({ getParameter: () => "360FB" });
                },
                error: (oError) => {
                    console.error("[DEBUG] Failed to send 360 feedback request:", oError);
                    MessageBox.error("Failed to send 360 feedback request. Please try again.");
                }
            });
        },

        async onChangePasswordPress() {
            if (!this._oChangePassDialog) {
                this._oChangePassDialog = await this.loadFragment({
                    name: "project1.view.ChangePass",
                });
            }
            this._oChangePassDialog.open();
        },

        onClosePegDialog() {
            if (this._oPegDialog) {
                this._oPegDialog.close();
            }
        },

        onConfirmChangePassword: function () {
            const oView = this.getView();
            const sNewPassword = oView.byId("changeEmailInput1").getValue().trim();
            const sConfirmationPassword = oView.byId("changeEmailInput12").getValue().trim();
            if (!sNewPassword || !sConfirmationPassword) {
                MessageBox.error("Please fill in all fields.");
                return;
            }
            if (sNewPassword !== sConfirmationPassword) {
                MessageBox.error("Passwords do not match.");
                return;
            }
            const oUserModel = this.getOwnerComponent().getModel("user");
            const sEmail = oUserModel.getProperty("/USER_EMAIL").toUpperCase();
            const sPassword = sNewPassword.toUpperCase();
            const sPassword1 = sConfirmationPassword.toUpperCase();
            const oODataModel = this.getOwnerComponent().getModel();
            oODataModel.callFunction("/ForgotPassword", {
                method: "POST",
                urlParameters: {
                    EMAIL: sEmail,
                    PASSWORD: sPassword,
                    PASSWORD1: sPassword1
                },
                success: (oData) => {
                    MessageToast.show("Password changed successfully!");
                    this.onCloseDialog();
                },
                error: (oError) => {
                    console.error("[DEBUG] Change Password failed:", oError);
                    MessageBox.error("Failed to change password. Please try again.");
                }
            });
        },

        onCloseDialog() {
            if (this._oChangePassDialog) {
                this._oChangePassDialog.close();
            }
        },

        onLogoutPress() {
            MessageBox.confirm("Are you sure you want to log out", {
                onClose: (oAction) => {
                    if (oAction === MessageBox.Action.OK) {
                        this.getRouter().navTo("RouteView1");
                    }
                }
            });
        },

        _applyPegFilters: function () {
            const oPegTable = this.byId("pegTable");
            const oBinding = oPegTable.getBinding("items");
            const oDatePicker = this.byId("DP1");
            const oComboBox = this.byId("combobox1");

            const aFilters = [];

            const oDate = oDatePicker.getDateValue();
            if (oDate) {
                const oStartDate = new Date(oDate.getFullYear(), oDate.getMonth(), oDate.getDate(), 0, 0, 0);
                const oEndDate = new Date(oDate.getFullYear(), oDate.getMonth(), oDate.getDate(), 23, 59, 59);
                aFilters.push(new Filter("FB_DATE", FilterOperator.BT, oStartDate, oEndDate));
            }

            const sSelectedKey = oComboBox.getSelectedKey();
            if (sSelectedKey) {
                aFilters.push(new Filter("FB_STATUS", FilterOperator.EQ, sSelectedKey));
            }
            oBinding.filter(aFilters);
        },

        onPegStatusFilterChange: function () {
            this._applyPegFilters();
        },

        onDateChange: function () {
            this._applyPegFilters();
        },

        _applyFbFilters: function () {
            const oFbTable = this.byId("FbTable");
            const oBinding = oFbTable.getBinding("items");
            const oDatePicker = this.byId("DP2");
            const oComboBox = this.byId("combobox3");
            const oSearchField = this.byId("fbReceiverSearchField");

            const aFilters = [];

            const oDate = oDatePicker.getDateValue();
            if (oDate) {
                const oStartDate = new Date(oDate.getFullYear(), oDate.getMonth(), oDate.getDate(), 0, 0, 0);
                const oEndDate = new Date(oDate.getFullYear(), oDate.getMonth(), oDate.getDate(), 23, 59, 59);
                aFilters.push(new Filter("FB_DATE", FilterOperator.BT, oStartDate, oEndDate));
            }

            const sSelectedKey = oComboBox.getSelectedKey();
            if (sSelectedKey) {
                aFilters.push(new Filter("FB_STATUS", FilterOperator.EQ, sSelectedKey));
            }

            const sReceiverName = oSearchField.getValue().trim();
            if (sReceiverName) {
                aFilters.push(new Filter("RECEIVER_NAME", FilterOperator.Contains, sReceiverName));
            }
            oBinding.filter(aFilters);
        },

        onFbStatusFilterChange: function (oEvent) {
            this._applyFbFilters();
        },

        onFbDateChange: function (oEvent) {
            this._applyFbFilters();
        },

        onFbReceiverSearch: function (oEvent) {
            this._applyFbFilters();
        },

        onNewFeedback: function () {
            this.getRouter().navTo("RouteFeedbackPage");
        },

        onTabSelect(oEvent) {
            const sSelectedKey = oEvent.getParameter("key");
            const oUserModel = this.getOwnerComponent().getModel("user");
            const sLoggedInUserEmail = oUserModel.getProperty("/USER_EMAIL");
            const bIsManager = oUserModel.getProperty("/SU");
            const oODataModel = this.getOwnerComponent().getModel();
            const oViewModel = this.getView().getModel("view");

            const oFbModel = this.getView().getModel("fbData");
            if (oFbModel) {
                oFbModel.setProperty("/selectedFeedback", null);
            }
            oViewModel.setProperty("/fbVisible", false);

            Promise.all([
                this._getEmployeeNameMap(),
                this._getProjectNameMap()
            ]).then(([oNameMap, oProjectMap]) => {
                if (sSelectedKey === "Pegs") {
                    const sFunctionName = (bIsManager === true || bIsManager === "TRUE" || bIsManager === "X") ? "/GetPEG_MNG" : "/GetPEG_FI";
                    oODataModel.callFunction(sFunctionName, {
                        method: "GET",
                        urlParameters: { EMAIL: sLoggedInUserEmail },
                        success: (oData) => {
                            const aPegData = (oData && oData.results) ? oData.results.map(item => ({
                                ...item,
                                RECEIVER_NAME: oNameMap[item.RECEIVER_ID] || item.RECEIVER_ID,
                                PROJECT_NAME: item.PROJECT_NAME || oProjectMap[item.PROJECT_ID] || "Unknown Project"
                            })) : [];
                            this.getOwnerComponent().setModel(new JSONModel({ Pegs: aPegData }), "pegData");
                        },
                        error: (oError) => {
                            MessageBox.error("Failed to load peg data.");
                            this.getOwnerComponent().setModel(new JSONModel({ Pegs: [] }), "pegData");
                        }
                    });
                } else if (sSelectedKey === "360FB") {
                    oODataModel.callFunction("/Get360", {
                        method: "GET",
                        urlParameters: { EMAIL: sLoggedInUserEmail },
                        success: (oData) => {
                            console.log("[DEBUG] OData call to /Get360 successful. Raw data:", oData);
                            const aFbData = (oData && oData.results) ? oData.results.map(item => ({
                                ...item,
                                SENDER_NAME: oNameMap[item.SENDER_ID] || item.SENDER_ID,
                                RECEIVER_NAME: oNameMap[item.RECEIVER_ID] || item.RECEIVER_ID,
                                PROJECT_NAME: item.PROJECT_NAME || oProjectMap[item.PROJECT_ID] || "Unknown Project"
                            })) : [];
                            this.getView().setModel(new JSONModel({ Feedbacks: aFbData }), "fbData");
                        },
                        error: (oError) => {
                            MessageBox.error("Failed to load 360 feedback data.");
                            this.getView().setModel(new JSONModel({ Feedbacks: [] }), "fbData");
                        }
                    });
                }
            }).catch(() => {
                MessageBox.error("Failed to load mapping data. Please check your OData service.");
            });
        },

        onItemPressed: function () {
            this.getRouter().navTo("RouteRatePegPage");
        },
        onFbSelect: function (oEvent) {
            const oItem = oEvent.getParameter("listItem");
            const oContext = oItem.getBindingContext("fbData");

            if (!oContext) {
                console.error("[DEBUG] No context found for the selected item.");
                this.getView().getModel("view").setProperty("/selectedFeedback", null);
                this.getView().getModel("view").setProperty("/fbVisible", false);
                return;
            }

            const oSelectedItem = oContext.getObject();

            this.getView().getModel("view").setProperty("/selectedFeedback", oSelectedItem);
            this.getView().getModel("view").setProperty("/fbVisible", true);
        }
    });
});