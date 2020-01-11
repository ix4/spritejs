"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadTexture = loadTexture;
exports.applyTexture = applyTexture;
exports.createTexture = createTexture;
exports.drawTexture = drawTexture;
exports.loadFrames = loadFrames;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _core = require("@mesh.js/core");

var _attribute_value = require("./attribute_value");

require("gl-matrix").glMatrix.setMatrixArrayType(Array);

var loadedTextures = {};

function loadTexture(src, alias) {
  if (loadedTextures[src]) return loadedTextures[src];

  var img = _core.ENV.loadImage(src, {
    alias: alias,
    useImageBitmap: false
  });

  return img != null ? img : src;
}

function applyTexture(_x, _x2, _x3) {
  return _applyTexture.apply(this, arguments);
}

function _applyTexture() {
  _applyTexture = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee(node, image, updateContours) {
    var textureImage, _node$attributes, width, height, textureRect, oldImage;

    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            textureImage = image;

            if (typeof image === 'string') {
              textureImage = loadTexture(image);
            }

            if (!(textureImage && typeof textureImage.then === 'function')) {
              _context.next = 6;
              break;
            }

            _context.next = 5;
            return textureImage;

          case 5:
            textureImage = _context.sent;

          case 6:
            if (image === node.attributes.texture) {
              if (textureImage && textureImage.image) {
                if (textureImage.sourceRect) {
                  node.attributes.sourceRect = textureImage.sourceRect;
                }

                node.textureImageRotated = !!textureImage.rotated;
                textureImage = textureImage.image;
              }

              _node$attributes = node.attributes, width = _node$attributes.width, height = _node$attributes.height, textureRect = _node$attributes.textureRect;
              oldImage = node.textureImage;
              node.textureImage = textureImage;

              if (updateContours && oldImage !== textureImage && !textureRect && (width == null || height == null)) {
                node.updateContours();
              }

              node.forceUpdate();
            }

            return _context.abrupt("return", textureImage);

          case 8:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _applyTexture.apply(this, arguments);
}

var _textureMap = Symbol('textureMap');

function createTexture(image, renderer) {
  renderer[_textureMap] = renderer[_textureMap] || new Map();

  if (renderer[_textureMap].has(image)) {
    return renderer[_textureMap].get(image);
  }

  var texture = renderer.createTexture(image);

  renderer[_textureMap].set(image, texture);

  return texture;
}

var _textureContext = Symbol('textureContext');

function drawTexture(node, mesh) {
  var textureImage = node.textureImage;
  var textureImageRotated = node.textureImageRotated;
  var texture = mesh.texture;

  if (textureImage) {
    var contentRect = node.originalContentRect;
    var textureRect = node.attributes.textureRect;
    var textureRepeat = node.attributes.textureRepeat;
    var sourceRect = node.attributes.sourceRect;

    if (!texture || node[_textureContext] && node[_textureContext] !== node.renderer || texture.image !== textureImage || texture.options.repeat !== textureRepeat || !(0, _attribute_value.compareValue)(texture.options.rect, textureRect) || !(0, _attribute_value.compareValue)(texture.options.srcRect, sourceRect)) {
      var newTexture = createTexture(textureImage, node.renderer);

      if (textureRect) {
        textureRect[0] += contentRect[0];
        textureRect[1] += contentRect[1];
      } else {
        textureRect = contentRect;
      }

      mesh.setTexture(newTexture, {
        rect: textureRect,
        repeat: textureRepeat,
        srcRect: sourceRect,
        rotated: textureImageRotated
      });
      node[_textureContext] = node.renderer;
    }
  } else if (texture) {
    mesh.setTexture(null);
  }
}
/**
  u3d-json compatible: https://www.codeandweb.com/texturepacker
  {
    frames: {
      key: {
        frame: {x, y, w, h},
        trimmed: ...,
        rotated: true|false,
        spriteSourceSize: {x, y, w, h},
        sourceSize: {w, h}
      }
    }
  }
  */


function loadFrames(_x4, _x5) {
  return _loadFrames.apply(this, arguments);
}

function _loadFrames() {
  _loadFrames = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee2(src, frameData) {
    var response, texture, frames;
    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (!(typeof frameData === 'string')) {
              _context2.next = 7;
              break;
            }

            _context2.next = 3;
            return fetch(frameData, {
              method: 'GET',
              mode: 'cors',
              cache: 'default'
            });

          case 3:
            response = _context2.sent;
            _context2.next = 6;
            return response.json();

          case 6:
            frameData = _context2.sent;

          case 7:
            _context2.next = 9;
            return loadTexture(src);

          case 9:
            texture = _context2.sent;
            frames = frameData.frames;
            Object.entries(frames).forEach(function (_ref) {
              var _ref2 = (0, _slicedToArray2.default)(_ref, 2),
                  key = _ref2[0],
                  frame = _ref2[1];

              var _frame$frame = frame.frame,
                  x = _frame$frame.x,
                  y = _frame$frame.y,
                  w = _frame$frame.w,
                  h = _frame$frame.h;
              var sourceRect = [x, y, w, h];
              var rotated = frame.rotated;

              if (rotated) {
                sourceRect = [sourceRect[0], sourceRect[1], sourceRect[3], sourceRect[2]];
              }

              loadedTextures[key] = {
                image: texture,
                sourceRect: sourceRect,
                rotated: rotated
              };
            });
            return _context2.abrupt("return", texture);

          case 13:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _loadFrames.apply(this, arguments);
}