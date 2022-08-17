//import audio (from itch.io)


const audio = {
    shoot: new Howl({
        src: './audio/Basic_shoot_noise.wav',
        volume: 0.04}),
    dmg: new Howl({
        src: './audio/Damage_taken.wav',
        volume: 0.1
    }),
    kill: new Howl({
        src: './audio/kill.wav',
        volume: 0.1
    }),
    powerUp: new Howl({
        src: './audio/Powerup_noise.wav',
        volume: 0.1
    }),
    death: new Howl({
        src: './audio/Death.wav',
        volume: 0.1
    }),
    select: new Howl({
        src: './audio/Select.wav',
        volume: 0.1,
        //safari hack to play sound
        html5: true
    }),
    bgm: new Howl({
        src: './audio/Hyper.wav',
        volume: 0.08,
        loop: true
    })
};


