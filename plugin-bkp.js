CKEDITOR.plugins.add('wkikimgupload', {
  icons: 'wkikimgupload',
  allowedContent: 'img[alt,!src,width,height,data-width,data-height]{border-style,border-width,float,height,margin‌​,margin-bottom,margi‌​n-left,margin-right,‌​margin-top,width}',
  init: function (editor) {
    editor.addCommand('wkikimgupload', {
      exec: function (editor) {
        a = document.createElement('input')
        a.setAttribute('type', 'file')
        a.setAttribute('accept', '.jpg,.jpeg,.png,.tif,.gif,.svg')
        a.click()
        a.onchange = function (event) {
          const file = a.files[0];

          curr = CKEDITOR.currentInstance
          if (['jpeg', 'jpg', 'png', 'svg', 'gif', 'tif', 'svg+xml'].indexOf(file.type.split('/')[1]) === -1) {
            editor.showNotification("The uploaded image is not of an acceptable format ('jpeg', 'jpg', 'png', 'svg', 'gif', 'tif', 'svg+xml')", "warning", 2500)

            return
          }
          img = new Image()
          img.onload = function () {
            inputWidth = this.width
            inputHeight = this.height
          }
          img.src = window.URL.createObjectURL(file)

          loaderElem = new CKEDITOR.dom.element('loader-elem')
          loaderHtmlStr = '<div style="position: relative; z-index: 100;width: 100%;height: 100%;text-align: center;background: white;opacity: 0.75;pointer-events:none">' + '<div style="width: 100%;height: 30px;margin-top: 100px;">Please wait while he image is uploading...</div>' + '</div>'
          loaderDomEle = CKEDITOR.dom.element.createFromHtml(loaderHtmlStr)
          loaderElem.append(loaderDomEle)
          editor.insertElement(loaderElem)
          CKEDITOR.currentInstance.setReadOnly(true)

          const fReader = new FileReader();

          if (file) {
            fReader.readAsDataURL(file);
          }

          let imageURL = "", imageName = ""

          fReader.addEventListener("load", async function () {
            imageURL = fReader.result
            imageName = file.name
            imageType = file.type.split('/')[1]

            try {
              const response = await fetch('http://localhost:5000/api_templates/addBlogImage?project_id=280', {  //editor.config.imageUploadURL
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                },
                body: JSON.stringify({
                  imageURL: imageURL,
                  imageName: imageName,
                  imageType: imageType,
                })
              })
              debugger;
              if (response.status === 200) {
                const data = await response.json()

                CKEDITOR.instances[curr.name].setReadOnly(false)
                url = data.url
                elem = new CKEDITOR.dom.element('span')
                maxWidth = Math.min(inputWidth, 600)
                maxHeight = Math.min(inputHeight, 600)
                if ((maxWidth / maxHeight) > (inputWidth / inputHeight)) {
                  width = (maxWidth * inputWidth) / inputHeight
                  height = maxHeight
                } else if ((maxWidth / maxHeight) < (inputWidth / inputHeight)) {
                  width = maxWidth
                  height = (maxHeight * inputHeight) / inputWidth
                } else {
                  width = maxWidth
                  height = maxHeight
                }
                newLine = CKEDITOR.dom.element.createFromHtml('<p><br></p>')

                imgElem = `<img 
                  data-cke-saved-src="${url}" 
                  class="cke_widget_element" 
                  src="${url}"
                  data-widget="image"
                  data-cke-widget-keep-attr="0"
                  data-width="${inputWidth}" data-height="${inputHeight}"
                  data-cke-widget-upcasted="1"
                  height="${height} width="${width}"
                  data-cke-widget-data=${encodeURIComponent(JSON.stringify({
                    "hasCaption":false,
                    "src":url,
                    "alt":"",
                    "width": width,
                    "height": height,
                    "lock":true,
                    "align":"left",
                    "classes":null
                  }))}
                >`
                imgDomElem = CKEDITOR.dom.element.createFromHtml(imgElem)
                
                elem = CKEDITOR.dom.element.createFromHtml(
                    `<span 
                      tabindex="-1" 
                      contenteditable="false" 
                      data-cke-widget-wrapper="1" 
                      data-cke-filter="off" 
                      class="cke_widget_wrapper cke_widget_inline cke_widget_image cke_image_nocaption cke_widget_selected" 
                      data-cke-display-name="image" 
                      data-cke-widget-id="15" 
                      role="region" 
                      aria-label=" image widget"
                    >
                      ${imgElem}
                      <span 
                        class="cke_reset cke_widget_drag_handler_container" 
                        style="background: url(&quot;https://workik-ckeditor-new.s3.amazonaws.com/plugins/widget/images/handle.png&quot;) rgba(220, 220, 220, 0.5); top: -15px; left: 0px;">
                        <img 
                          class="cke_reset cke_widget_drag_handler" 
                          data-cke-widget-drag-handler="1" 
                          src="data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==" 
                          width="15" 
                          title="Click and drag to move" 
                          height="15" 
                          role="presentation" 
                          draggable="true">
                      </span>
                    </span>
                  `
                )
                  
              
                editor.insertElement(newLine)
                editor.insertElement(elem)
                editor.insertElement(newLine)
                loaderElem.remove()
              } else {
                loaderElem.remove()
                throw new Error('Image Could Not Be Added')
              }
            } catch (e) {
              loaderElem.remove()
              CKEDITOR.instances[curr.name].setReadOnly(false)
              editor.showNotification("Image could not be uploaded", "warning", 2500)
            }

          }, false);
        }
      }
    });

    editor.ui.addButton('wkikimgupload', {
      label: 'Image Uploader',
      command: 'wkikimgupload',
      toolbar: 'insert'
    });
  }
});
