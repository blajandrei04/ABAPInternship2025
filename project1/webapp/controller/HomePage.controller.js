sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], (Controller, MessageToast, MessageBox, History, JSONModel, Filter, FilterOperator) => {
    "use strict";

    return Controller.extend("project1.controller.HomePage", {
        _oPegDialog: null,
        _oChangePassDialog: null,

        onInit() {
            console.log("HomePage Controller initialized");
            this.getRouter()
                .getRoute("RouteHomePage")
                .attachPatternMatched(this._onObjectMatched, this);

            // Set up a local model for filter dropdowns with corrected statuses
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

            // New local model for view state
            const oViewModel = new JSONModel({
                selectedTabKey: "Info",
                fbVisible: false,
                selectedFeedback: null
            });
            this.getView().setModel(oViewModel, "view");
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
            oODataModel.read("/EMPLOYEESet", {
                success: (oData) => {
                    const aProjectData = [...new Set(oData.results.map(item => item.TEAM_ID))]
                        .filter(id => id)
                        .map(id => ({ PROJECT_ID: id }));
                    this.getView().setModel(new JSONModel({ Projects: aProjectData }), "projects");

                    const aManagers = oData.results.filter(item => item.SU && String(item.SU).toUpperCase() === 'TRUE');
                    this.getView().setModel(new JSONModel({ Managers: aManagers }), "managers");

                    this._oPegDialog.open();
                },
                error: (oError) => {
                    MessageBox.error("Failed to load project and manager lists.");
                }
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

            const oODataModel = this.getOwnerComponent().getModel();
            oODataModel.callFunction("/RequestPEG_FI", {
                method: "POST",
                urlParameters: {
                    EMAIL: sLoggedInUserEmail,
                    PROJECT_ID: sProjectId,
                    SENDER_NAME: sManagerEmail
                },
                success: (oData) => {
                    MessageToast.show("PEG request sent successfully!");
                    this.onClosePegDialog();
                    this.onTabSelect({ getParameter: () => "Pegs" });
                },
                error: (oError) => {
                    console.error("[DEBUG] Failed to send PEG request:", oError);
                    MessageBox.error("Failed to send PEG request. Please try again.");
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

        // --- Pegs Table Filter Logic ---
        _applyPegFilters: function () {
            const oPegTable = this.byId("pegTable");
            const oBinding = oPegTable.getBinding("items");
            const oDatePicker = this.byId("DP1");
            const oComboBox = this.byId("combobox1");

            const aFilters = [];

            // Get filter from DatePicker
            const oDate = oDatePicker.getDateValue();
            if (oDate) {
                const oFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({ pattern: "E MMM dd yyyy HH:mm:ss 'GMT'Z (z)" });
                const sFormattedDate = oFormat.format(oDate);
                aFilters.push(new Filter("FB_DATE", FilterOperator.EQ, sFormattedDate));
            }

            // Get filter from ComboBox
            const sSelectedKey = oComboBox.getSelectedKey();
            if (sSelectedKey) {
                aFilters.push(new Filter("FB_STATUS", FilterOperator.EQ, sSelectedKey));
            }

            // Apply all filters
            oBinding.filter(aFilters);
        },

        onPegStatusFilterChange: function () {
            this._applyPegFilters();
        },

        onDateChange: function () {
            this._applyPegFilters();
        },

        // --- 360 Feedback Table Filter Logic ---
        _applyFbFilters: function () {
            const oFbTable = this.byId("FbTable");
            const oBinding = oFbTable.getBinding("items");
            const oDatePicker = this.byId("DP2");
            const oComboBox = this.byId("combobox3");
            const oSearchField = this.byId("fbReceiverSearchField");

            const aFilters = [];

            // Get filter from DatePicker
            const oDate = oDatePicker.getDateValue();
            if (oDate) {
                const oFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({ pattern: "E MMM dd yyyy HH:mm:ss 'GMT'Z (z)" });
                const sFormattedDate = oFormat.format(oDate);
                aFilters.push(new Filter("FB_DATE", FilterOperator.EQ, sFormattedDate));
            }

            // Get filter from ComboBox
            const sSelectedKey = oComboBox.getSelectedKey();
            if (sSelectedKey) {
                aFilters.push(new Filter("FB_STATUS", FilterOperator.EQ, sSelectedKey));
            }

            // Get filter from SearchField
            const sReceiverName = oSearchField.getValue().trim();
            if (sReceiverName) {
                aFilters.push(new Filter("RECEIVER_NAME", FilterOperator.Contains, sReceiverName));
            }
            
            // Apply all filters
            oBinding.filter(aFilters);
        },

        onFbStatusFilterChange: function (oEvent) {
            this._applyFbFilters();
        },

        onFbDateChange: function (oEvent) {
            this._applyFbFilters();
        },

        onFbReceiverSearch: function(oEvent) {
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


            if (sSelectedKey === "Pegs") {
                this._getEmployeeNameMap().then(oNameMap => {
                    const sFunctionName = (bIsManager === true || bIsManager === "TRUE" || bIsManager === "X") ? "/GetPEG_MNG" : "/GetPEG_FI";
                    oODataModel.callFunction(sFunctionName, {
                        method: "GET",
                        urlParameters: { EMAIL: sLoggedInUserEmail },
                        success: (oData) => {
                            const aPegData = (oData && oData.results) ? oData.results.map(item => ({
                                ...item,
                                RECEIVER_NAME: oNameMap[item.RECEIVER_ID] || item.RECEIVER_ID,
                                PROJECT_NAME: item.PROJECT_NAME || item.PROJECT_ID
                            })) : [];
                            this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel({ Pegs: aPegData }), "pegData");
                        },
                        error: (oError) => {
                            MessageBox.error("Failed to load peg data.");
                            this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel({ Pegs: [] }), "pegData");
                        }
                    });
                }).catch(() => {
                    MessageBox.error("Failed to load employee names for Pegs.");
                });
            } else if (sSelectedKey === "360FB") {
                this._getEmployeeNameMap().then(oNameMap => {
                    oODataModel.callFunction("/Get360", {
                        method: "GET",
                        urlParameters: { EMAIL: sLoggedInUserEmail },
                        success: (oData) => {
                            console.log("[DEBUG] OData call to /Get360 successful. Raw data:", oData);
                            const aFbData = (oData && oData.results) ? oData.results.map(item => ({
                                ...item,
                                SENDER_NAME: oNameMap[item.SENDER_ID] || item.SENDER_ID,
                                RECEIVER_NAME: oNameMap[item.RECEIVER_ID] || item.RECEIVER_ID,
                                PROJECT_NAME: item.PROJECT_NAME || item.PROJECT_ID
                            })) : [];
                            this.getView().setModel(new sap.ui.model.json.JSONModel({ Feedbacks: aFbData }), "fbData");
                        },
                        error: (oError) => {
                            MessageBox.error("Failed to load 360 feedback data.");
                            this.getView().setModel(new sap.ui.model.json.JSONModel({ Feedbacks: [] }), "fbData");
                        }
                    });
                }).catch(() => {
                    MessageBox.error("Failed to load employee names for 360 Feedback.");
                });
            }
        },

        onItemPressed: function () {
            this.getRouter().navTo("RouteRatePegPage");
        },
        onPegPressed: function (oEvent) {
            const oItem = oEvent.getSource(); // sau oEvent.getParameter("listItem")
            const oCtx = oItem.getBindingContext("pegData");
            const sFbId = oCtx.getProperty("FB_ID");


            const oODataModel = this.getOwnerComponent().getModel(); // OData v2 model
            oODataModel.read("/FB_CATSet('" + sFbId + "')", {
                success: function (oData) {
                    // după ce am citit, navigăm
                    this.getRouter().navTo("RouteRatePeg", {
                        fbId: sFbId
                    });
                }.bind(this),
                error: function (oError) {

                    this.getRouter().navTo("RouteRatePeg", {
                        fbId: sFbId
                    });
                }.bind(this)
            });
        }
        ,

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