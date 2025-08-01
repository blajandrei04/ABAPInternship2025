sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel"
], (Controller, MessageToast, MessageBox, History, JSONModel) => {
    "use strict";

    return Controller.extend("project1.controller.360FB", {
        onInit() {
            console.log("360FB initialized");
        },
        getRouter() {
            return sap.ui.core.UIComponent.getRouterFor(this);
        }
    });









    
});