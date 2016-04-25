define(["mvc/list/list-view","mvc/history/history-model","mvc/history/history-contents","mvc/history/history-preferences","mvc/history/hda-li","mvc/history/hdca-li","mvc/user/user-model","mvc/ui/error-modal","ui/fa-icon-button","mvc/base-mvc","utils/localization","ui/search-input"],function(a,b,c,d,e,f,g,h,i,j,k){"use strict";var l=a.ModelListPanel,m=l.extend({_logNamespace:"history",HDAViewClass:e.HDAListItemView,HDCAViewClass:f.HDCAListItemView,collectionClass:c.HistoryContents,modelCollectionKey:"contents",tagName:"div",className:l.prototype.className+" history-panel",emptyMsg:k("This history is empty"),noneFoundMsg:k("No matching datasets found"),searchPlaceholder:k("search datasets"),initialize:function(a){l.prototype.initialize.call(this,a),this.linkTarget=a.linkTarget||"_blank"},_createDefaultCollection:function(){return new this.collectionClass([],{history:history})},freeModel:function(){return l.prototype.freeModel.call(this),this.model&&this.model.clearUpdateTimeout(),this},_setUpListeners:function(){l.prototype._setUpListeners.call(this),this.on({error:function(a,b,c,d,e){this.errorHandler(a,b,c,d,e)},"loading-done":function(){this.render(),this.views.length||this.trigger("empty-history",this)},"views:ready view:attached view:removed":function(){this._renderSelectButton()}})},loadHistory:function(a,c,d){this.info("loadHistory:",a,c,d);var e=this;return e.setModel(new b.History({id:a})),e.trigger("loading"),e.model.fetchWithContents(c,d).always(function(){e.trigger("loading-done")})},refreshContents:function(a){return this.model?this.model.refresh(a):$.when()},setModel:function(a,b){l.prototype.setModel.call(this,a,b),this.model&&this._setUpWebStorage()},_setUpModelListeners:function(){return l.prototype._setUpModelListeners.call(this),this.listenTo(this.model,{"change:id":this._setUpWebStorage})},_setUpCollectionListeners:function(){return l.prototype._setUpCollectionListeners.call(this),this.listenTo(this.collection,{"fetching-more":this.showContentsLoadingIndicator,"fetching-more-done":this.hideContentsLoadingIndicator})},_setUpWebStorage:function(){return this.model&&this.model.id?(this.storage&&this.stopListening(this.storage),this.storage=new d.HistoryPrefs({id:d.HistoryPrefs.historyStorageKey(this.model.get("id"))}),this.trigger("new-storage",this.storage,this),this.log(this+" (init'd) storage:",this.storage.get()),this.listenTo(this.storage,{"change:show_deleted":function(a,b){this.showDeleted=b},"change:show_hidden":function(a,b){this.showHidden=b}},this),this.showDeleted=this.storage.get("show_deleted")||!1,this.showHidden=this.storage.get("show_hidden")||!1,this):this},_buildNewRender:function(){var a=l.prototype._buildNewRender.call(this);return this._renderSelectButton(a),a},_renderEmptyMessage:function(a){var b=this,c=!b.model.get("contents_active").active,d=b.$emptyMessage(a);return c?d.empty().append(b.emptyMsg).show():b.searchFor&&b.model.contents.haveSearchDetails()&&!b.views.length?d.empty().append(b.noneFoundMsg).show():$()},_renderSelectButton:function(a){if(a=a||this.$el,!this.multiselectActions().length)return null;if(!this.views.length)return this.hideSelectors(),a.find(".controls .actions .show-selectors-btn").remove(),null;var b=a.find(".controls .actions .show-selectors-btn");return b.size()?b:i({title:k("Operations on multiple datasets"),classes:"show-selectors-btn",faIcon:"fa-check-square-o"}).prependTo(a.find(".controls .actions"))},renderItems:function(a){a=a||this.$el;var b=this,c=b.model.contents,d=c.hidsPerSection,e=b.model.get("contents_active")||0;return e.active<d?l.prototype.renderItems.call(b,a):(b.$list(a).html(c._mapSectionRanges(function(a){return b.templates.listItemsSection(a)}).join("\n")),b.views=b._getCurrentSectionCollection().map(function(a){return b._createItemView(a)}),b.$emptyMessage(a).hide(),b.$currentSection(a).replaceWith(b.views.map(function(a){return b._renderItemView$el(a)})),b.trigger("views:ready",b.views),b.views)},_getCurrentSectionCollection:function(){return this.model.contents._filterCurrentSectionCollection(_.bind(this._filterItem,this))},$currentSection:function(a){var b='.list-items-section[data-section="'+this.model.contents.currentSection+'"]';return this.$list(a).find(b)},_getItemViewClass:function(a){var b=a.get("history_content_type");switch(b){case"dataset":return this.HDAViewClass;case"dataset_collection":return this.HDCAViewClass}throw new TypeError("Unknown history_content_type: "+b)},_filterItem:function(a){var b=this;return l.prototype._filterItem.call(b,a)&&(!a.hidden()||b.showHidden)&&(!a.isDeletedOrPurged()||b.showDeleted)},_getItemViewOptions:function(a){var b=l.prototype._getItemViewOptions.call(this,a);return _.extend(b,{linkTarget:this.linkTarget,expanded:!!this.storage.get("expandedIds")[a.id],hasUser:this.model.ownedByCurrUser()})},_setUpItemViewListeners:function(a){var b=this;return l.prototype._setUpItemViewListeners.call(b,a),b.listenTo(a,{expanded:function(a){b.storage.addExpanded(a.model)},collapsed:function(a){b.storage.removeExpanded(a.model)}})},collapseAll:function(){this.storage.set("expandedIds",{}),l.prototype.collapseAll.call(this)},getSelectedModels:function(){var a=l.prototype.getSelectedModels.call(this);return a.historyId=this.collection.historyId,a},showContentsLoadingIndicator:function(a){a=_.isNumber(a)?a:this.fxSpeed,this.$emptyMessage().is(":visible")&&this.$emptyMessage().hide();var b=this.$(".contents-loading-indicator");return b.size()?b.stop().clearQueue():(b=$(this.templates.contentsLoadingIndicator({},this)).hide(),b.insertAfter(this.$("> .list-items")).slideDown(a))},hideContentsLoadingIndicator:function(a){a=_.isNumber(a)?a:this.fxSpeed,this.$("> .contents-loading-indicator").slideUp({duration:100,complete:function(){$(this).remove()}})},events:_.extend(_.clone(l.prototype.events),{"click .show-selectors-btn":"toggleSelectors","click .messages [class$=message]":"clearMessages","click .list-items-section":function(a){this.openSection($(a.currentTarget).data("section"))}}),openSection:function(a){var b=this;return b.model.contents.fetchSection(a).done(function(){b.model.contents.currentSection=a,b.renderItems()})},toggleShowDeleted:function(a,b){a=void 0!==a?a:!this.showDeleted,b=void 0!==b?b:!0;var c=this;c.showDeleted=a,c.model.contents.includeDeleted=a,c.trigger("show-deleted",a),b&&c.storage.set("show_deleted",a);var d=c.collection.last(),e=d?d.get("hid"):0,f=jQuery.when();return a&&(f=c.model.contents.fetchDeleted({silent:!0,filters:{"hid-ge":e}})),f.done(function(){c.renderItems()}),c.showDeleted},toggleShowHidden:function(a,b){a=void 0!==a?a:!this.showHidden,b=void 0!==b?b:!0;var c=this;c.showHidden=a,c.model.contents.includeHidden=a,c.trigger("show-hidden",a),b&&c.storage.set("show_hidden",a);var d=jQuery.when();return a&&(d=c.model.contents.fetchHidden({silent:!0})),d.done(function(){c.renderItems()}),c.showHidden},_firstSearch:function(a){var b=this,c="> .controls .search-input",d=b.model.contents.length;return this.log("onFirstSearch",a),b.model.contents.haveSearchDetails()?void b.searchItems(a):(b.$(c).searchInput("toggle-loading"),void b.model.contents.progressivelyFetchDetails({silent:!0}).progress(function(a,c,e){e+a.length<=d?b.renderItems():b.listenToOnce(b.model.contents,"sync",b.bulkAppendItemViews)}).always(function(){b.$el.find(c).searchInput("toggle-loading")}).done(function(){b.searchItems(b.searchFor)}))},errorHandler:function(a,b,c){if(!b||0!==b.status||0!==b.readyState){if(this.error(a,b,c),_.isString(a)&&_.isString(b)){var d=a,e=b;return h.errorModal(d,e,c)}return b&&502===b.status?h.badGatewayErrorModal():h.ajaxErrorModal(a,b,c)}},clearMessages:function(a){var b=_.isUndefined(a)?this.$messages().children('[class$="message"]'):$(a.currentTarget);return b.fadeOut(this.fxSpeed,function(){$(this).remove()}),this},scrollToHid:function(a){return this.scrollToItem(_.first(this.viewsWhereModel({hid:a})))},toString:function(){return"HistoryView("+(this.model?this.model.get("name"):"")+")"}});return m.prototype.templates=function(){var a=j.wrapTemplate(["<div>",'<div class="controls"></div>','<div class="list-items"></div>','<div class="empty-message infomessagesmall"></div>',"</div>"]),b=j.wrapTemplate(['<div class="controls">','<div class="title">','<div class="name"><%- history.name %></div>',"</div>",'<div class="subtitle"></div>','<div class="history-size"><%- history.nice_size %></div>','<div class="actions"></div>',"<% if( history.deleted && history.purged ){ %>",'<div class="deleted-msg warningmessagesmall">',k("This history has been purged and deleted"),"</div>","<% } else if( history.deleted ){ %>",'<div class="deleted-msg warningmessagesmall">',k("This history has been deleted"),"</div>","<% } else if( history.purged ){ %>",'<div class="deleted-msg warningmessagesmall">',k("This history has been purged"),"</div>","<% } %>",'<div class="messages">',"<% if( history.message ){ %>",'<div class="<%= history.message.level || "info" %>messagesmall">',"<%= history.message.text %>","</div>","<% } %>","</div>",'<div class="tags-display"></div>','<div class="annotation-display"></div>','<div class="search">','<div class="search-input"></div>',"</div>",'<div class="list-actions">','<div class="btn-group">','<button class="select-all btn btn-default"','data-mode="select">',k("All"),"</button>",'<button class="deselect-all btn btn-default"','data-mode="select">',k("None"),"</button>","</div>",'<div class="list-action-menu btn-group">',"</div>","</div>","</div>"],"history"),c=j.wrapTemplate(['<div class="contents-loading-indicator">','<span class="fa fa-2x fa-spin fa-spinner">',"</span></div>"],"history"),d=j.wrapTemplate(['<button class="prev">previous</button>','<% function getHid( content ){ return content? content.get( "hid" ) : "?"; } %>','<button class="pages">',"<%- getHid( view.model.contents.last() ) %> to <%- getHid( view.model.contents.first() ) %>","</button>",'<button class="next">next</button>'],"history"),e=j.wrapTemplate(['<li class="list-items-section" data-section="<%- section.number %>">','<a href="javascript:void(0)" data-first-hid="<%- section.first %>" data-last-hid="<%- section.last %>">',"<%- section.first %>  ",k("to")," <%- section.last %>","</a></li>"],"section");return _.extend(_.clone(l.prototype.templates),{el:a,controls:b,contentsLoadingIndicator:c,pagination:d,listItemsSection:e})}(),{HistoryView:m}});
//# sourceMappingURL=../../../maps/mvc/history/history-view.js.map