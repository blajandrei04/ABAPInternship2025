sap.ui.define([
  "sap/ui/core/UIComponent",
  "sap/ui/model/json/JSONModel"
], function (UIComponent, JSONModel) {
  "use strict";

  return UIComponent.extend("project1.Component", {
    metadata: {
      manifest: "json"
    },

    init: function () {
      // call the init function of the parent
      UIComponent.prototype.init.apply(this, arguments);

      // Create the global view model and set it on the component
      const oViewModel = new JSONModel({
        selectedTabKey: "Info",
        fbVisible: false,
        selectedFeedback: null
      });
      this.setModel(oViewModel, "view");

      // initialize the router
      this.getRouter().initialize();
    }
  });
});