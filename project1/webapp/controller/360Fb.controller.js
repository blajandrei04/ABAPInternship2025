sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/routing/History"
], (BaseController, History) => {
  "use strict";

  return BaseController.extend("project1.controller.360Fb", {
      onInit() {
        console.log("360Fb Controller initialized");
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