sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/routing/History"
], (BaseController, History) => {
  "use strict";

  return BaseController.extend("project1.controller.Peg", {
      onInit() {
        console.log("Peg Controller initialized");
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
                this.getRouter().navTo("RouteHomePage", {}, true /*no history*/);
            }
        }
  });
});