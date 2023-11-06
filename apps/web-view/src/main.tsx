import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Quagga from '@ericblade/quagga2';

ReactDOM
    .createRoot(document.getElementById('root') as HTMLElement)
    .render(
        <React.StrictMode>
            <APP />
        </React.StrictMode>,
    );


function APP() {
    useEffect(() => {
        Quagga.init({
            inputStream : {
              name : "Live",
              type : "LiveStream",
              target: document.querySelector('#yourElement')!,
            //   constraints: {
            //     width: {min: 640},
            //     height: {min: 480},
            //     facingMode: "environment",
            //     aspectRatio: {min: 1, max: 2}
            //     }
            },
            // locator: {
            //     patchSize: "medium",
            //     halfSample: true
            // },
            // numOfWorkers: 2,
            // frequency: 10,
            // locate: true,
            decoder : {
              readers : ["ean_reader"]
            }
          }, function(err) {
              if (err) {
                  console.log(' ОШИБКА ', err);
                  return
              }
              console.log("Initialization finished. Ready to start");

              // var streamLabel = Quagga.CameraAccess.getActiveStreamLabel();
              Quagga.start();
          });

        //   Quagga.onProcessed((res) => {
        //     console.log(res);

        //   })

    
          Quagga.onDetected(function(result) {
            var code = result;

            if (code.codeResult.startInfo.error === 0) {
                console.log('CODE', code.codeResult.code, code);
            }
        });
    }, []);

    const copyHandler = () => {
        navigator.clipboard.writeText('/scanned 12345');
    };

    return (
        <div>
            test
            <button onClick={copyHandler}>COPY</button>
            <div id="yourElement"></div>
        </div>
    );
}