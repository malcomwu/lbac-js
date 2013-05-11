/*global define*/

define([
    'jquery',
    'lodash',
    'backbone',
    'templates',
    'models/content',
    'models/setting',
    'collections/pager',
    'views/pager',
    'views/setting',
    'views/console',
    'data/toc'
], function ($, _, Backbone, JST, Content, Setting, Pager, PagerView, SettingView, ConsoleView, toc) {
    'use strict';

    // Contents view
    var ContentView = Backbone.View.extend({
        infoTemplate: JST['app/scripts/templates/info.ejs'],

        initialize: function () {

            // cache the elements
            this.$info = this.$('#info');
            this.$doc = this.$('#doc');
            this.$editorArea = this.$('#editor-area');
            this.$console = this.$('#console');
            this.$codeArea = this.$('#code-area');
            this.$code = this.$('#code');

            this.content = new Content();
            this.setting = new Setting();

            this.pager = new Pager();
            this.topPagerView = new PagerView({
                el: '#top-pager',
                collection: this.pager
            });
            this.bottomPagerView = new PagerView({
                el: '#bottom-pager',
                collection: this.pager
            });

            this.listenTo(this.content, 'change:doc', this.renderDoc);
            this.listenTo(this.content, 'change:code', this.renderCode);
            this.listenTo(this.content, 'change:hasEditor', this.toggleEditor);
            this.listenTo(this.content, 'change:hasConsole', this.toggleConsole);
            this.listenTo(this.setting, 'change:editor', this.toggleEditor);
            this.listenTo(this.setting, 'change:console', this.toggleConsole);

            this.render();
        },

        render: function () {
            this.$info.show();
            this.settingView = new SettingView({ model: this.setting });
            this.consoleView = new ConsoleView({ el: '#console' });
            this.$codeArea.show();
        },

        // Update the content view
        update: function (ch, sec) {
            this.pager.update(ch, sec);

            this.$info.html(this.infoTemplate({
                ch: ch,
                title: toc[ch].title.toUpperCase().replace(/ /g, '&nbsp;')
            }));
            this.content.update(ch, sec);
            this.updateConsole(ch, sec);
        },

        // Update the console view and the content model.
        updateConsole: function (ch, sec) {
            var hasConsole = false,
                hasEditor = false,
                section;

            if (sec) {
                hasConsole = this.consoleView.update(ch, sec);
                section = _.find(toc[ch].sections, { sec: sec });
                hasEditor = !!section.editor;
            }

            this.content.set('hasConsole', hasConsole);
            this.content.set('hasEditor', hasEditor);
        },

        // Render the doc
        renderDoc: function (content) {
            this.settingView.$el.detach();
            this.$doc.html(content.get('doc'));
            this.$doc.children(':first-child').after(this.settingView.el);
        },

        // Render the code
        renderCode: function (content) {
            this.$code.html(content.get('code'));
        },

        // Toggle the editor
        toggleEditor: function () {
            var visible = this.content.get('hasEditor') &&
                    this.setting.get('editor');
            this.$editorArea.toggle(visible);
        },

        // Toggle the console
        toggleConsole: function () {
            var visible = this.content.get('hasConsole') &&
                    this.setting.get('console');
            this.$console.toggle(visible);
        }
    });

    return ContentView;
});
