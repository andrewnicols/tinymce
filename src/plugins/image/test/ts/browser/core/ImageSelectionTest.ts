import { ApproxStructure, GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Merger } from '@ephox/katamari';

import Plugin from 'tinymce/plugins/image/Plugin';
import Theme from 'tinymce/themes/modern/Theme';

import { insertOrUpdateImage } from 'tinymce/plugins/image/core/ImageSelection';

UnitTest.asynctest('browser.tinymce.plugins.image.core.ImageSelectionTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  Theme();
  Plugin();

  const sUpdateImageOrFigure = (editor, data) => {
    return Step.sync(() => {
      insertOrUpdateImage(editor, Merger.merge({
        src: 'image.png',
        alt: '',
        title: '',
        width: '200',
        height: '',
        class: '',
        style: '',
        caption: false,
        hspace: '',
        vspace: '',
        border: '',
        borderStyle: ''
      }, data));
    });
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Logger.t('Insert image, size 100x100', GeneralSteps.sequence([
        tinyApis.sSetContent('<p></p>'),
        tinyApis.sSetCursor([0], 0),
        sUpdateImageOrFigure(editor, {
          src: 'image.png',
          height: '100',
          width: '100'
        }),
        tinyApis.sAssertContentStructure(ApproxStructure.build(function (s, str) {
          return s.element('div', {
            children: [
              s.element('p', {
                children: [
                  s.element('img', {
                    attrs: {
                      src: str.is('image.png'),
                      alt: str.is(''),
                      width: str.is('100'),
                      height: str.is('100')
                    }
                  }),
                  s.element('br', {})
                ]
              })
            ]
          });
        }))
      ])),
      Logger.t('Insert figure, size 100x100', GeneralSteps.sequence([
        tinyApis.sSetContent('<p></p>'),
        tinyApis.sSetCursor([0], 0),
        sUpdateImageOrFigure(editor, {
          src: 'image.png',
          caption: true,
          height: '100',
          width: '100'
        }),
        tinyApis.sAssertContentStructure(ApproxStructure.build(function (s, str) {
          return s.element('div', {
            children: [
              s.element('figure', {
                attrs: {
                  class: str.is('image'),
                  contenteditable: str.is('false')
                },
                children: [
                  s.element('img', {
                    attrs: {
                      src: str.is('image.png'),
                      alt: str.is(''),
                      width: str.is('100'),
                      height: str.is('100')
                    }
                  }),
                  s.element('figcaption', {
                    attrs: {
                      contenteditable: str.is('true')
                    },
                    children: [
                      s.text(str.is('Caption'))
                    ]
                  })
                ]
              }),
              s.element('p', {}),
              s.anything()
            ]
          });
        }))
      ])),
      Logger.t('Update figure, new dimensions and src', GeneralSteps.sequence([
        tinyApis.sSetContent('<figure class="image" contenteditable="false">' +
          '<img src="image.png" alt="" width="200" height="200">' +
          '<figcaption contenteditable="true">Caption</figcaption>' +
          '</figure>'),
        tinyApis.sSelect('figure', []),
        sUpdateImageOrFigure(editor, {
          src: 'updated-image.png',
          caption: true,
          height: '100',
          width: '100'
        }),
        tinyApis.sAssertContentStructure(ApproxStructure.build(function (s, str) {
          return s.element('div', {
            children: [
              s.element('figure', {
                attrs: {
                  class: str.is('image'),
                  contenteditable: str.is('false')
                },
                children: [
                  s.element('img', {
                    attrs: {
                      'src': str.is('updated-image.png'),
                      'alt': str.is(''),
                      'width': str.is('100'),
                      'height': str.is('100'),
                      'data-mce-src': str.is('updated-image.png')
                    }
                  }),
                  s.element('figcaption', {
                    attrs: {
                      contenteditable: str.is('true')
                    },
                    children: [
                      s.text(str.is('Caption'))
                    ]
                  })
                ]
              }),
              s.anything()
            ]
          });
        }))
      ])),
      Logger.t('Update image, new dimensions and src', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>' +
          '<img src="image.png" alt="" width="200" height="200">' +
          '</p>'),
        tinyApis.sSelect('img', []),
        sUpdateImageOrFigure(editor, {
          src: 'updated-image.png',
          height: '100',
          width: '100'
        }),
        tinyApis.sAssertContentStructure(ApproxStructure.build(function (s, str) {
          return s.element('div', {
            children: [
              s.element('p', {
                children: [
                  s.element('img', {
                    attrs: {
                      'src': str.is('updated-image.png'),
                      'alt': str.is(''),
                      'width': str.is('100'),
                      'height': str.is('100'),
                      'data-mce-src': str.is('updated-image.png')
                    }
                  })
                ]
              })
            ]
          });
        }))
      ]))
    ], onSuccess, onFailure);
  }, {
    plugins: 'image',
    indent: false,
    inline: true,
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});