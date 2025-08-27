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
      const oViewModel = this.getOwnerComponent().getModel("view");
      const oSelectedFeedback = oViewModel.getProperty("/selectedFeedback");

      // Check if the data exists before binding
      if (oSelectedFeedback) {
          this.getView().byId("FeedbackDetailsPage").setBindingContext(
              oViewModel.createBindingContext("/selectedFeedback"), "view"
          );
          console.log("[FeedbackDetails] Binding context set successfully.");
      } else {
          console.warn("[FeedbackDetails] No selected feedback data found in the model.");
      }
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