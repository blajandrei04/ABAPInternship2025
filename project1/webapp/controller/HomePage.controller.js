sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel"
], (Controller, MessageToast, MessageBox, History, JSONModel) => {
    "use strict";

    return Controller.extend("project1.controller.HomePage", {
        onInit() {
            console.log("Home page initialized");
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
                this.getRouter().navTo("RouteView1", {}, true /*no history*/);
            }
        },
        onGiveFeedback(){
            this.getRouter().navTo("Route360FbPage");
        },
        onRequestPeg(){
            this.getRouter().navTo("RoutePegPage");
        }
    });
});