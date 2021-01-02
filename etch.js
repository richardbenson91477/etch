var s = {
    w: 640, h: 480,
    context: null,
    invalid_: false,
    buttons: null,
    graph: null,
    tick_c: 0,
    canvas_x: 0, canvas_y: 0,
    page_w: 0, page_h: 0,
    page_n: 0, page_c: 0,
    point_w: 0, point_h: 0,
    playing_: false, tick_n: 0, tick_c: 0,
    mouse_but: 0, mouse_x1: 0, mouse_y1: 0, 
        mouse_x2: 0, mouse_y2: 0, mouse_rad: 0,
    draw_mode: 0
}

window.onload = function () {
    var canvas = document.getElementById ("canvas");
    canvas.width = s.w;
    canvas.height = s.h;
    s.canvas_x = canvas.offsetLeft;
    s.canvas_y = canvas.offsetTop;
    canvas.addEventListener ("onmousedown", onmousedown);
    canvas.addEventListener ("onmouseup", onmouseup);
    canvas.addEventListener ("onmousemove", onmousemove);
    
    s.context = canvas.getContext ("2d");

    init ();
    setInterval ("tick()", 50);
}

init = function () {
    var c;
    
    s.page_w = 35;
    s.page_h = 30;
    
    s.point_w = s.w / s.page_w;
    s.point_h = s.h / s.page_h;
    
    s.mouse_rad = s.point_h / 2;

    s.page_n = 8;
    
    s.graph = [];
    for (c = 0; c < s.page_n; c ++)
        s.graph[c] = []

    s.page_c = 0;
    
    s.playing_ = false;
    s.tick_n = 4;
    s.tick_cnt = 0;
    
    s.mouse_but = 0;
    s.draw_mode = true;

    s.buttons = [];
    s.buttons[0] = [1, 1, 3, 2, on_button_pup, "b_pup.svg"];
    s.buttons[1] = [1, 4, 3, 2, on_button_pdown, "b_pdown.svg"];
    s.buttons[2] = [1, 7, 3, 2, on_button_copy, "b_copy.svg"];
    s.buttons[3] = [1, 10, 3, 2, on_button_mode, "b_mode.svg"];
    s.buttons[4] = [1, 13, 3, 2, on_button_play, "b_play.svg"];
    for (c = 0; c < s.buttons.length; c ++) {
        s.buttons[c][6] = new Image();
        s.buttons[c][6].src = s.buttons[c][5];
    }
 
    s.tick_c = 0;
}

tick = function () {
    s.tick_c ++;
    if ((s.invalid_) || (s.tick_c == 10)) {
        redraw ();
        s.invalid_ = false;
        s.tick_c = 0;
    }
  
    if (s.playing_) {
        s.tick_cnt ++;
        if (s.tick_cnt >= s.tick_n) {
            s.tick_cnt = 0;
 
            s.page_c ++;
            if (s.page_c >= s.page_n) 
                s.page_c = 0;
            redraw ();
        }
    }
}

redraw = function () {
    var cx, cy;
    
    // tab background
    s.context.fillStyle = "rgba(40, 40, 40, 1.0)";
    s.context.fillRect (0, 0, 5 * s.point_w + 1, s.h);
 
    // buttons
    for (cx = 0; cx < s.buttons.length; cx ++) {
        s.context.drawImage (s.buttons[cx][6], 
            s.buttons[cx][0] * s.point_w, 
            s.buttons[cx][1] * s.point_h,
            s.buttons[cx][2] * s.point_w, 
            s.buttons[cx][3] * s.point_h );
    }
    
    // unset
    s.context.beginPath();
    s.context.fillStyle = "rgba(20, 20, 20, 1.0)";
    s.context.fillRect (
        5 * s.point_w, 
        0, 
        s.point_w * (s.page_w - 5), 
        s.point_h * s.page_h);

    // set
    s.context.fillStyle = "rgba(222, 222, 222, 1.0)";
    for (cy = 0; cy < s.page_h; cy ++)
        for (cx = 0; cx < s.page_h; cx ++)
            if (s.graph[s.page_c][cy * s.page_h + cx])
                s.context.fillRect (
                    (cx + 5) * s.point_w, 
                    cy * s.point_h, 
                    s.point_w, 
                    s.point_h);

    s.context.closePath ();
    s.context.fill ();
 
    // mouse
    if (s.mouse_but) {
        if (s.draw_mode)
            s.context.fillStyle = "rgba(222, 100, 222, 0.8)";
        else
            s.context.fillStyle = "rgba(222, 222, 100, 0.8)";
        var halfpi = Math.PI / 2;
        s.context.beginPath ();
        s.context.arc (s.mouse_x1, s.mouse_y1, s.mouse_rad, 0, 
            Math.PI + Math.PI, false);
        s.context.closePath ();
        s.context.fill ();
        s.context.beginPath ();
        s.context.moveTo (s.mouse_x2, s.mouse_y2);
        ma = Math.atan2 (s.mouse_x2 - s.mouse_x1, s.mouse_y2 - s.mouse_y1);
        s.context.lineTo (
            s.mouse_x1 + Math.sin (ma + halfpi) * s.mouse_rad, 
            s.mouse_y1 + Math.cos (ma + halfpi) * s.mouse_rad );
        s.context.lineTo (
            s.mouse_x1 + Math.sin (ma - halfpi) * s.mouse_rad, 
            s.mouse_y1 + Math.cos (ma - halfpi) * s.mouse_rad );
        s.context.moveTo (s.mouse_x2, s.mouse_y2);
        s.context.closePath ();
        s.context.fill ();
    }
}

onmousedown = function (e) {
    s.mouse_x1 = s.mouse_x2 = e.pageX - s.canvas_x;
    s.mouse_y1 = s.mouse_y2 = e.pageY - s.canvas_y;

    var point = classify (s.mouse_x1, s.mouse_y1);

    // graph area click
    if (point[0])
        s.mouse_but = e.which;
    // button area click    
    else {
        if (! point[1])
            return;
        s.buttons[point[1] - 1][4] ();
    }
}

onmouseup = function (e) {
    if (! s.mouse_but)
        return;
    s.mouse_but = 0;

    s.mouse_x2 = e.pageX - s.canvas_x;
    s.mouse_y2 = e.pageY - s.canvas_y;
    
    var dx = s.mouse_x2 - s.mouse_x1;
    var dy = s.mouse_y2 - s.mouse_y1;
    var p, page_x, py;
    var line_len = Math.sqrt (dx * dx + dy * dy);
    var line_step = 1.0 / (line_len / s.point_h);
    for (var line_t = 0.0; line_t <= 1.0; line_t += line_step) {
        if (line_t > 1.0)
            line_t = 1.0;

        p = classify (
            s.mouse_x1 +(line_t * dx),
            s.mouse_y1 +(line_t * dy) );

        if (! p[0])
            continue;

        px = p[1];
        py = p[2];
       
        if ((px >= 0) && (px < s.page_h) && 
                (py >= 0) && (py < s.page_h))
            s.graph[s.page_c][py * s.page_h + px] = s.draw_mode;
    }

    s.invalid_ = true;
}

onmousemove = function (e) {
    if (! s.mouse_but) 
        return;
    
    s.mouse_x2 = e.pageX - s.canvas_x;
    s.mouse_y2 = e.pageY - s.canvas_y;
    
    s.invalid_ = true;
}

classify = function (x, y) {
    var x_f = parseFloat (x) / s.w;
    var y_f = parseFloat (y) / s.h;
    var px = parseInt (x_f * s.page_w);
    var py = parseInt (y_f * s.page_h);

    // graph click
    if (px > 4) 
        return [true, px -5, py] 

    // button click
    for (var c = 0; c < s.buttons.length; c ++) {
        if ((px >= s.buttons[c][0]) && 
            (px < (s.buttons[c][0] + s.buttons[c][2])) &&
            (py >= s.buttons[c][1]) && 
            (py < (s.buttons[c][1] + s.buttons[c][3])))
            return [false, c + 1];
    }

    return [false, 0];
}

on_button_pup = function () {
    s.page_c --;
    if (s.page_c < 0) 
        s.page_c = s.page_n - 1;
    s.invalid_ = true;
}

on_button_pdown = function () {
    s.page_c ++;
    if (s.page_c >= s.page_n) 
        s.page_c = 0;
    s.invalid_ = true;
}

on_button_copy = function () {
    var page_last = s.page_c - 1;
    if (page_last < 0) 
        page_last = s.page_n - 1;

    for (var c = 0; c < (s.page_h * s.page_h); c ++) {
        if (! s.graph[page_last][c])
            s.graph[s.page_c][c] = false;
        else
            s.graph[s.page_c][c] = true;
    }
    s.invalid_ = true;
}

on_button_mode = function () {
    s.draw_mode = !s.draw_mode;
}

on_button_play = function () {
    s.playing_ = !s.playing_;
}

