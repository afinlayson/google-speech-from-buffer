/**
 * Copyright 2017 Nate Lewis All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const GoogleCloudSpeech = require('@google-cloud/speech');

/**
 * Wrapper for Google Speech API to send raw buffered audio to recognize.
 * @example
 * const Speech = require('../google-speech-from-buffer');
 * let speech = new Speech({
 *   sampleRateHertz: 16000,  // default
 *   encoding: 'LINEAR16',    // default
 *   languageCode: 'en-US',   // default
 *   }
 * );
 * speech.recognize(buffer).then((statement) => {
 *   console.log(statement);
 * });
 */
class Speech {
  /**
   * @param       {Object} config
   * @param       {number} config.sampleRateHertz - Sample rate (default: 16000)
   * @param       {string} config.encoding - Encoding type (default: LINEAR16)
   * @param       {string} config.languageCode - Language code (default:en-US)
   * @constructor Speech
   */
  constructor(config) {
    let defaults = {
      sampleRateHertz: 16000,
      encoding: 'LINEAR16',
      languageCode: 'en-US',
    };

    // extend defaults
    this.config = Object.assign({}, defaults, config);

    // make sure a service key is there, bail if not
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS === undefined) {
      console.log('Your google service account key and project environment ');
      console.log('variables are required. Create it here within your GCP');
      console.log('project: https://console.cloud.google.com/apis/credentials');
      console.log('Then export it so the app can use it like this:');
      console.log('> export GOOGLE_APPLICATION_CREDENTIALS=[json file]');
      process.exit(0);
    }

    
    this.speechClient = new GoogleCloudSpeech();
  }
  
  request(buffer) {
    let audio = {
      content: buffer.toString('base64'),
    };
    return {
      audio: audio,
      config: this.config,
    };
  }
  
  recognize(buffer) {
    let self = this;
    return new Promise(function(resolve, reject) {
      const request = self.request(buffer);

      // Detects speech in the audio file
      self.speechClient.recognize(request)
        .then((results) => {          
          return resolve(results);
        }).catch((err) => {
          return reject(err);
        });
    });
  }
 
  /**
   * A promise when speech recognition is complete
   *
   * @promise speechRecognitionPromise
   * @fulfill {string} The translated response from speech recognition
   * @reject {Error} Google API did not return a valid response
   */

  /**
   * Send buffer to Google Speech APIs
   * @param  {Buffer} buffer - Raw audio data from file or stream
   * @return {speechRecognitionPromise} A promise when recognition is complete
   */
    recognizeString(buffer) {
    let self = this;
    return new Promise(function(resolve, reject) {
      const request = self.request(buffer);

      // Detects speech in the audio file
      self.speechClient.recognize(request)
        .then((results) => {
          if (typeof(results[0]) !== 'undefined' &&
              typeof(results[0].results[0]) !== 'undefined') {
            return resolve(results[0].results[0].alternatives[0].transcript);
          } else {
            return resolve('');
          }
        }).catch((err) => {
          return reject(err);
        });
    });
  }
}

module.exports = Speech;
