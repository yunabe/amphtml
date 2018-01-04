/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {urls} from './config';
import {Services} from './services';
import {experimentToggles, isCanary} from './experiments';
import {getLengthNumeral} from './layout';
import {getModeObject} from './mode-object';
import {DomFingerprint} from './utils/dom-fingerprint';
import {dict} from './utils/object.js';

/**
 * Produces the attributes for the ad template.
 * @param {!Window} parentWindow
 * @param {!AmpElement} element
 * @param {!string} sentinel
 * @param {!JsonObject=} attributes
 * @return {!JsonObject}
 */
export function getContextMetadata(
  parentWindow, element, sentinel, attributes) {
  const startTime = Date.now();
  const width = element.getAttribute('width');
  const height = element.getAttribute('height');
  attributes = attributes ? attributes : dict();
  attributes['width'] = getLengthNumeral(width);
  attributes['height'] = getLengthNumeral(height);
  if (element.getAttribute('title')) {
    attributes['title'] = element.getAttribute('title');
  }
  let locationHref = parentWindow.location.href;
  // This is really only needed for tests, but whatever. Children
  // see us as the logical origin, so telling them we are about:srcdoc
  // will fail ancestor checks.
  if (locationHref == 'about:srcdoc') {
    locationHref = parentWindow.parent.location.href;
  }

  const docInfo = Services.documentInfoForDoc(element);
  const viewer = Services.viewerForDoc(element);
  const referrer = viewer.getUnconfirmedReferrerUrl();

  // TODO(alanorozco): Redesign data structure so that fields not exposed by
  // AmpContext are not part of this object.
  const layoutRect = element.getPageLayoutBox();
  attributes['_context'] = dict({
    'ampcontextVersion': '$internalRuntimeVersion$',
    'ampcontextFilepath': urls.thirdParty + '/$internalRuntimeVersion$' +
        '/ampcontext-v0.js',
    'sourceUrl': docInfo.sourceUrl,
    'referrer': referrer,
    'canonicalUrl': docInfo.canonicalUrl,
    'pageViewId': docInfo.pageViewId,
    'location': {
      'href': locationHref,
    },
    'startTime': startTime,
    'tagName': element.tagName,
    'mode': getModeObject(),
    'canary': isCanary(parentWindow),
    'hidden': !viewer.isVisible(),
    'initialLayoutRect': layoutRect ? {
      'left': layoutRect.left,
      'top': layoutRect.top,
      'width': layoutRect.width,
      'height': layoutRect.height,
    } : null,
    'initialIntersection': element.getIntersectionChangeEntry(),
    'domFingerprint': DomFingerprint.generate(element),
    'experimentToggles': experimentToggles(parentWindow),
    'sentinel': sentinel,
  });
  const adSrc = element.getAttribute('src');
  if (adSrc) {
    attributes['src'] = adSrc;
  }
  return attributes;
}

export function getSafeframeMetadata() {
    return "{\&quot;windowCoords_t\&quot;:23,\&quot;windowCoords_r\&quot;:1317,\&quot;windowCoords_b\&quot;:858,\&quot;windowCoords_l\&quot;:0,\&quot;frameCoords_t\&quot;:1169,\&quot;frameCoords_r\&quot;:525,\&quot;frameCoords_b\&quot;:1669,\&quot;frameCoords_l\&quot;:25,\&quot;styleZIndex\&quot;:\&quot;auto\&quot;,\&quot;allowedExpansion_t\&quot;:426,\&quot;allowedExpansion_r\&quot;:0,\&quot;allowedExpansion_b\&quot;:0,\&quot;allowedExpansion_l\&quot;:25,\&quot;xInView\&quot;:0.85,\&quot;yInView\&quot;:0.624}&quot;,&quot;permissions&quot;:&quot;{\&quot;expandByOverlay\&quot;:true,\&quot;expandByPush\&quot;:true,\&quot;readCookie\&quot;:false,\&quot;writeCookie\&quot;:false}&quot;,&quot;metadata&quot;:&quot;{\&quot;shared\&quot;:{\&quot;sf_ver\&quot;:\&quot;1-0-14\&quot;,\&quot;ck_on\&quot;:1,\&quot;flash_ver\&quot;:\&quot;0\&quot;}}&quot;,&quot;reportCreativeGeometry&quot;:false,&quot;isDifferentSourceWindow&quot;:false,&quot;goog_safeframe_hlt&quot;:{}}";
}
