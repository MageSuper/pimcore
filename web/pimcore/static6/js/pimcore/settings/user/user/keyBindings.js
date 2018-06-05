/**
 * Pimcore
 *
 * This source file is available under two different licenses:
 * - GNU General Public License version 3 (GPLv3)
 * - Pimcore Enterprise License (PEL)
 * Full copyright and license information is available in
 * LICENSE.md which is distributed with this source code.
 *
 * @copyright  Copyright (c) Pimcore GmbH (http://www.pimcore.org)
 * @license    http://www.pimcore.org/license     GPLv3 and PEL
 */


pimcore.registerNS("pimcore.settings.user.user.keyBindings");
pimcore.settings.user.user.keyBindings = Class.create({

    initialize: function (userPanel, userProfile) {
        this.userPanel = userPanel;
        this.userProfile = userProfile;
    },

    renderCode: function (code) {
        if (!code) {
            return;
        }
        var parts = [];
        if (code.ctrl) {
            parts.push(t("Ctrl"));
        }
        if (code.alt) {
            parts.push(t("Alt"));
        }

        if (code.shift) {
            parts.push(t("Shift"));
        }

        if (code.key) {
            if (code.key >= 112 && code.key <= 123) {
                parts.push("F" + (code.key - 111));
            } else {
                parts.push(String.fromCharCode(code.key));
            }
        }

        code = parts.join(" + ");

        return code;
    },

    getPanel: function () {
        var user = pimcore.globalmanager.get("user");

        var mapping = pimcore.helpers.keyBindingMapping;
        var keyBindings = Ext.decode(user.keyBindings);
        var keyBindingsAssoc = {};

        for (var key in keyBindings) {
            if (keyBindings.hasOwnProperty(key)) {
                var item = keyBindings[key];
                if (item == null) {
                    continue;
                }
                keyBindingsAssoc[item.action] = keyBindings[key];
            }
        }


        var generalItems = [];

        generalItems.push({
            xtype: 'panel',
            html: t('please_dont_forget_to_reload_pimcore'),
            minHeight:50
        });

        for (var action in mapping) {
            if (mapping.hasOwnProperty(action)) {

                var hiddenField = new Ext.form.field.Text({

                    value: Ext.encode(keyBindingsAssoc[action]),
                    width: 400,
                    hidden: true,
                    submitValue: true,
                    name: action
                });
                generalItems.push(hiddenField)

                generalItems.push(new Ext.form.field.Text({
                    fieldLabel: t("keybinding_" + action),
                    value: this.renderCode(keyBindingsAssoc[action]),
                    labelWidth: 200,
                    width: 500,
                    submitValue: false,
                    name: Ext.id(),
                    enableKeyEvents: true,
                    listeners: {
                        "focus": function () {
                            pimcore.keymap.disable();
                            window.document.onkeydown = function () {
                            };
                        },
                        "blur": function () {
                            window.document.onkeydown = null;
                            pimcore.keymap.enable();
                        },
                        "keydown": function (hiddenField, action, field, key) {
                            key.event.preventDefault();
                            if (key.keyCode == 46) {
                                var code = {
                                    action: action
                                };
                            } else {
                                var code = {
                                    action: action,
                                    key: key.keyCode,
                                    alt: key.altKey,
                                    ctrl: key.ctrlKey,
                                    shift: key.shiftKey
                                }
                            }
                            hiddenField.setValue(Ext.encode(code));
                            key.event.cancelBubble = true;
                            field.setValue(this.renderCode(code));
                            return false;
                        }.bind(this, hiddenField, action),
                        "keyup": function (hiddenField, action, field, key) {
                            key.event.preventDefault();
                            return false;
                        }.bind(this, hiddenField, action)
                    }

                }));
            }
        }



        this.panel = new Ext.form.FormPanel({
            title: this.userProfile ? "" : t("key_bindings"),
            items: generalItems,
            bodyStyle: "padding:10px;",
            autoScroll: true
        });

        return this.panel;
    },

    getValues: function () {

        var values = this.panel.getForm().getValues();

        return values;
    }


});
