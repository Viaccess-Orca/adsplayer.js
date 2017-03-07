/*
 * The copyright in this software module is being made available under the BSD License, included
 * below. This software module may be subject to other third party and/or contributor rights,
 * including patent rights, and no such rights are granted under this license.
 *
 * Copyright (C) 2016 VIACCESS S.A and/or ORCA Interactive
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted
 * provided that the following conditions are met:
 * - Redistributions of source code must retain the above copyright notice, this list of conditions
 *   and the following disclaimer.
 * - Redistributions in binary form must reproduce the above copyright notice, this list of
 *   conditions and the following disclaimer in the documentation and/or other materials provided
 *   with the distribution.
 * - Neither the name of Orange nor the names of its contributors may be used to endorse or promote
 *   products derived from this software module without specific prior written permission.
 *
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS “AS IS” AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER O
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY
 * WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

define([
    "intern",
    "intern!object",
    "intern/chai!assert"
    ],
    function(intern,object,assert){

    return {

        // Get event counter values for specified CSS selector
        getCounterValues : function(command, selector) {
            // Object containing the event counter values
            var json = {};

            // Return the result object in a promise
            return new Promise(function(resolve) {
                // Get all counter elements
                command.findAllByCssSelector(selector)
                    .then(function(elements) {
                        var promises = [];
                        // Loop through the elements
                        elements.forEach(function(element) {
                            // Get element data (id + value) in a promise
                            var p = new Promise(function(r) {
                                // Get element ID
                                element
                                    .getAttribute("eventId")
                                    .then(function(id) {
                                        // Get element value
                                        element
                                            .getAttribute("value")
                                            .then(function(value) {
                                                // Update the result object
                                                json[id] = value;

                                                // Once all the element data is fetched, resolve the element promise
                                                r();
                                            })
                                    });
                            });

                            promises.push(p);
                        });

                        // Wait until all element promises are resolved
                        Promise.all(promises).then(function() {
                            // Now that the JSON is full of data, resolve the main promise
                            resolve(json);
                        });
                    });
            });
        },

        // Compare real counter values against expected counter values
        compareCounters : function(realValues, expectedValues) {
            // Loop through the expected values
            for(var eventId in expectedValues) {
                if (expectedValues.hasOwnProperty(eventId)) {
                    // Check that event counter exists
                    assert.isDefined(realValues[eventId], "Impossible to find event '" + eventId + "' in events");

                    // Check that real value is as expected ("x" means "any")
                    if (expectedValues[eventId] !== "x") {
                        var expectedValue = parseInt(expectedValues[eventId]),
                            realValue = parseInt(realValues[eventId]);

                        assert.strictEqual(
                            realValue,
                            expectedValue,
                            "Wrong value for event '" + eventId + "'");
                    }

                }
            }

            // Loop through real values
            for(var eventId in realValues) {
                if (realValues.hasOwnProperty(eventId)) {
                    // Check that there were no unexpected event dispatched
                    var realValue = parseInt(realValues[eventId]);
                    assert.isFalse(realValue > 0 && !expectedValues[eventId], "Event '" + eventId + "' should not be dispatched");
                }
            }
        }
    };
});
