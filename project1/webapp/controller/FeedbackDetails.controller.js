sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/routing/History"
], (Controller, History) => {
  "use strict";

  return Controller.extend("project1.controller.FeedbackDetails", {
    onInit: function () {
      this.getOwnerComponent().getRouter()
        .getRoute("RouteFeedbackDetails")
        .attachPatternMatched(this._onObjectMatched, this);
    },

    _onObjectMatched: function () {
      console.log("[FeedbackDetails] Ruta a fost potrivita – am ajuns pe view-ul corect!");
      
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
    }
  });
});
