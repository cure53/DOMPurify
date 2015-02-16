<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title>DOMPurify 0.6.0 "Honeybadger"</title>
        <script src="https://rawgithub.com/cure53/DOMPurify/master/purify.js"></script>
        <!-- we don't actually need it - just to demo and test the $(html) sanitation -->
        <script src="//code.jquery.com/jquery-1.11.0.min.js"></script>
    </head>
    <body>
        <h4>DOMPurify 0.6.0 "Honeybadger"</h4>
        <p>
        This is the demo for <a href="https://github.com/cure53/DOMPurify">DOMPurify</a>, a DOM-only, super-fast, uber-tolerant XSS sanitizer for HTML, SVG and MathML.
        The textarea below contains sample-payload - you can also add your own. Watch it sanitize on the console or in the Iframe below.
        </p>
        <hr>
        <button onclick="
            var tx1 = Date.now();
            var xss = DOMPurify.sanitize(x.value);
            console.info('Operation took ' + (t=Date.now()-tx1) + ' milliseconds to complete.');
            console.log(xss);
            y.value=xss;
            document.title=t+'ms'
        ">Sanitize textarea value, then write result to console</button>
        <button onclick="
            var ifr = document.getElementById('ifr');
            var tx1 = Date.now();
            var xss = DOMPurify.sanitize(x.value);
            console.info('Operation took ' + (t=Date.now()-tx1) + ' milliseconds to complete.');
            ifr.contentDocument.open();
            ifr.contentDocument.write(xss);
            y.value=xss;
            ifr.contentDocument.close();
            document.title=t+'ms'
        ">Sanitize textarea value, then write result to DOM</button>
        <button title="This might not work with the large default payload. Better try with smaller, realistic values" onclick="
            var ifr = document.getElementById('ifr');
            var tx1 = Date.now();
            var xss = DOMPurify.sanitize(x.value, {SAFE_FOR_JQUERY: true});
            console.info('Operation took ' + (t=Date.now()-tx1) + ' milliseconds to complete.');
            $(ifr.contentDocument.body).html(xss);
            y.value=$(ifr.contentDocument.body).html();
            ifr.contentDocument.close();
            document.title=t+'ms'
        ">Sanitize textarea value, then use $(elm).html()</button>
        <hr>
        <!-- rendered test data goes in here -->
        <iframe src="about:blank" id="ifr" style="width:95%;height:100px"></iframe>
        <textarea placeholder="Payload goes here, test me, test me hard!" id="x" style="width:95%;height:200px"><!-- 
        The following block of HTML is a collection of test cases, attack vectors and hard-to-process HTML chunks. 
        DOMPurify will take the whole bunch and sanitize it. If you don't see an "alert" pop up afterwards, it means it worked :) 
        -->
        
        <%- examples %></textarea>
        <textarea placeholder="Here be the sanitized markup to inspect!" id="y" style="width:95%;height:200px"></textarea>
    </body>
</html>
