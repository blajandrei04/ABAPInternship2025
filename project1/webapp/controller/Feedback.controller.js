sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel"
], (Controller, MessageToast, MessageBox, History, JSONModel) => {
    "use strict";

    return Controller.extend("project1.controller.Feedback", {
        onInit() {
            console.log("Feedback Controller initialized");
            const oViewModel = new JSONModel({
                ReceiverID: "",
                ProjectID: "",
                anonymous: false,
                Users: [],
                Projects: [],
                selectedCategory: null,
                categoryRating: null,
                categoryComment: ""
            });
            this.getView().setModel(oViewModel);
            this._loadUserAndProjectData();
        },

        _loadUserAndProjectData: function () {
            const oODataModel = this.getOwnerComponent().getModel();
            const oViewModel = this.getView().getModel();

            oODataModel.read("/EMPLOYEESet", {
                success: (oData) => {
                    if (oData && oData.results) {
                        const aUsers = oData.results.map(item => ({
                            ID: item.EMP_ID,
                            Name: item.FULL_NAME
                        }));
                        oViewModel.setProperty("/Users", aUsers);
                        console.log("Users loaded successfully.");
                    } else {
                        console.log("No user data received.");
                    }
                },
                error: (oError) => {
                    console.error("Failed to load user data:", oError);
                    MessageBox.error("Failed to load user list. Please try again.");
                }
            });

            oODataModel.read("/ProjectSet", {
                success: (oData) => {
                    if (oData && oData.results) {
                        const aProjects = oData.results.map(item => ({
                            ProjectID: item.PROJECT_ID,
                            ProjectName: item.PROJECT_NAME
                        }));
                        oViewModel.setProperty("/Projects", aProjects);
                        console.log("Projects loaded successfully.");
                    } else {
                        console.log("No project data received.");
                    }
                },
                error: (oError) => {
                    console.error("Failed to load project data:", oError);
                    MessageBox.error("Failed to load project list. Please try again.");
                }
            });
        },

        getRouter() {
            return sap.ui.core.UIComponent.getRouterFor(this);
        },

        onNavBack: function () {
            const oHistory = History.getInstance();
            const sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getRouter().navTo("RouteHomePage", {}, true);
            }
        },

        onSendFeedback: function () {
            const oODataModel = this.getOwnerComponent().getModel();
            const oViewModel = this.getView().getModel();
            const oUserModel = this.getOwnerComponent().getModel("user");
            
            const oSendButton = this.getView().byId("sendFeedbackButton");

            if (!oUserModel || !oUserModel.getProperty("/isLoggedIn")) {
                MessageBox.error("You must be logged in to send feedback.");
                return;
            }

            const sLoggedInUserEmail = oUserModel.getProperty("/USER_EMAIL");
            const sReceiverID = oViewModel.getProperty("/ReceiverID");
            const sProjectID = oViewModel.getProperty("/ProjectID");
            const bAnonymous = oViewModel.getProperty("/anonymous");
            const sCategory = oViewModel.getProperty("/selectedCategory");
            const sRating = oViewModel.getProperty("/categoryRating");
            const sComment = oViewModel.getProperty("/categoryComment");

            if (!sReceiverID || !sProjectID || !sCategory || !sRating) {
                MessageBox.warning("Please select a User, a Project, a Category, and a Rating.");
                return;
            }
            
            const aProjects = oViewModel.getProperty("/Projects");
            const sProjectName = aProjects.find(p => p.ProjectID === sProjectID)?.ProjectName;

            const oParameters = {
                EMAIL: sLoggedInUserEmail,
                RECEIVER_NAME: sReceiverID,
                PROJECT_ID: sProjectID,
                PROJECT_NAME: sProjectName,
                ANONYMITY: bAnonymous ? "X" : " ",
                CATEGORY_COMMENT: sComment,
                CATEGORY_RATING: parseInt(sRating, 10),
                CATEGORY_NAME: sCategory
            };

            oODataModel.callFunction("/New_360", {
                method: "POST",
                urlParameters: oParameters,
                success: () => {
                    MessageToast.show(`Feedback for ${sCategory} sent successfully!`);
                    if (oSendButton) {
                        oSendButton.blur();
                    }
                    this.onNavBack();
                },
                error: (oError) => {
                    console.error(`Failed to send feedback for ${sCategory}:`, oError);
                    MessageBox.error(`An error occurred while sending feedback for ${sCategory}. Please try again.`);
                }
            });
        }
    });
});