/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {dev} from '../src/log';
import {dict} from '../src/utils/object.js';
import {getMode} from '../src/mode';
import {once} from '../src/utils/function.js';
import {parseJson} from '../src/json';
import {parseUrl} from '../src/url';


/**
 * @typedef {{
 *  ampcontextFilepath: ?string,
 *  ampcontextVersion: ?string,
 *  canary: ?boolean,
 *  canonicalUrl: ?string,
 *  clientId: ?string,
 *  container: ?string,
 *  domFingerprint: ?string,
 *  hidden: ?boolean,
 *  initialIntersection: ?IntersectionObserverEntry,
 *  initialLayoutRect:
 *      ?{left: number, top: number, width: number, height: number},
 *  pageViewId: ?string,
 *  referrer: ?string,
 *  sentinel: ?string,
 *  sourceUrl: ?string,
 *  startTime: ?number,
 *  tagName: ?string,
 * }}
 */
export let ContextStateDef;


/** @const {!JsonObject} */
const FALLBACK = dict({
  'attributes': dict({}),
  'context': dict({}),
  'config': dict({}),
});


const createFromWindowName_ = once(() => FrameMetadata.fromString(window.name));


function parseSerialized(serializedData) {
  try {
    return parseJson(serializedData);
  } catch (err) {
    if (!getMode().test) {
      dev().info(
          'INTEGRATION', 'Could not parse context from:', serializedData);
    }
    return FALLBACK;
  }
}


export class FrameMetadata {
  /** @return {!FrameMetadata} */
  static fromWindowName() {
    // Defined indirectly since `once()` cannot be used with `static`.
    return createFromWindowName_();
  }

  /**
   * @param {string} serializedData
   * @return {!FrameMetadata}
   */
  static fromString(serializedData) {
    return FrameMetadata.fromObj(parseSerialized(serializedData));
  }

  /**
   * @param {!JsonObject} obj
   * @return {!FrameMetadata}
   */
  static fromObj(obj) {
    return new FrameMetadata(obj);
  }

  /**
   * @param {!JsonObject} obj
   */
  constructor(obj) {
    /** @private @const {!JsonObject} */
    this.obj_ = obj;
  }

  /** @retun {string} */
  getLocation() {
    return parseUrl(this.obj_['context']['location']['href']);
  }

  /** @return {!ContextStateDef} */
  getContextState() {
    return /** @type {!ContextStateDef} */ ({
      ampcontextFilepath: this.obj_['context']['ampcontextFilepath'],
      ampcontextVersion: this.obj_['context']['ampcontextVersion'],
      canary: this.obj_['context']['canary'],
      canonicalUrl: this.obj_['context']['canonicalUrl'],
      clientId: this.obj_['context']['clientId'],
      container: this.obj_['context']['container'],
      domFingerprint: this.obj_['context']['domFingerprint'],
      hidden: this.obj_['context']['hidden'],
      initialIntersection: this.obj_['context']['initialIntersection'],
      initialLayoutRect: this.obj_['context']['initialLayoutRect'],
      pageViewId: this.obj_['context']['pageViewId'],
      referrer: this.obj_['context']['referrer'],
      sentinel: this.obj_['context']['sentinel'],
      sourceUrl: this.obj_['context']['sourceUrl'],
      startTime: this.obj_['context']['startTime'],
      tagName: this.obj_['context']['tagName'],
    });
  }

  /** @return {string} */
  getEmbedType() {
    return this.obj_['type'];
  }

  /** @return {{mode: !Object, experimentToggles: !Object}} */
  getAmpConfig() {
    return {
      mode: this.obj_['config'].mode,
      experimentToggles: this.obj_['config'].experimentToggles,
    };
  }

  /** @return {!JsonObject} */
  getAttributeData() {
    return this.obj_['attributes'];
  }

  /** @return {?string} */
  getSentinelOptional() {
    return this.obj_['context']['sentinel'] || null;
  }
}
