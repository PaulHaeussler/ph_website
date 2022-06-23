#version 300 es
#define PI 3.14159265359

precision highp float;


in vec2 v_texcoord;

uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 outColor;


void main() {

    float border_offset = 0.1;

    float t_scale = 1.0;

    if(u_mouse.x < 1.0 && u_mouse.x > 0.0 && u_mouse.y < 1.0 && u_mouse.y > 0.0){
        //isHovering
        t_scale = 3.0;
    }

    float st = (sin(u_time*t_scale) + 1.0) / 2.0;



    vec4 rainbowCircle = vec4((sin(u_time*t_scale-(2.0/3.0)*PI) + 1.0) / 2.0,
                         st,
                         (sin(u_time*t_scale+(2.0/3.0)*PI) + 1.0) / 2.0, 1.0);
    vec4 bg = rainbowCircle;
    vec4 fg = vec4(0.0, 0.0, 0.0, 1.0);

    vec4 tex = texture(u_texture, ((v_texcoord/(1.0 - border_offset) + 1.0) / 2.0));
    if(abs(v_texcoord.x) > (1.0 - border_offset) || abs(v_texcoord.y) > (1.0 - border_offset)){
        tex = vec4(0.0);

    }

    // outColor = mix(bg, vec4(u_mouse.x, 0.0, u_mouse.y, 1.0), mix_hover);
    outColor = mix(bg, fg, tex.a);
    // outColor = vec4((v_texcoord + 1.0) / 2.0, 0.5, 1.0);
}