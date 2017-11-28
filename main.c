#include <stdio.h>
#define N 15
static unsigned int   buf[N];

#define CLEAN_BUFF() do{\
    for(unsigned char t = 0; t < N; t++)\
        buf[t] = 0;\
} while(0);

#define ABS(x) (((x)>=0)?(x):(x)*-1)


unsigned char isLeagul(unsigned int x, unsigned int y);
static void q();
static void console(unsigned int t);


int main() {
    CLEAN_BUFF();
    q();
}


unsigned char isLeagul(unsigned int x, unsigned int y) {
    unsigned int coluOr = 0;
    for(unsigned char i = 0; i < N; i++) {
        coluOr |= buf[i] & x;
    }
    unsigned int delta = 0;
    for(unsigned char i = 0; i < N; i++) {
        delta |= ((buf[i]>>ABS(y-i)) | (buf[i]<<ABS(y-i))) & x;
    }
    if((buf[y]==0) && (coluOr==0) && (delta == 0))
        return 1;
    else
        return 0;
}

void q() {
    unsigned int t = 0;
    unsigned int y = 0, x = 1;
    while(y < N) {
        while(x < 1<<N) {
            if(isLeagul(x, y)) {
                buf[y] = x;
                x = 1;
                break;
            } else {
                x = x<<1;
            }
        }
        if(buf[y]==0) {
            if(y == 0)
                break;
            else {
                y--;
                x = buf[y]<<1;
                if(x==0)
                    x=1;
                buf[y] = 0;
                continue;
            }
        }
        if(y == N-1) {
            t++;
            console(t);
            x = buf[y]<<1;
            buf[y] = 0;
            if(t > 1000) // Fix time limmit
                break;
            continue;
        }

        y++;
    }

}
void console(unsigned int t) {
    printf("%03d-----\n", t);
    for(unsigned char i = 0; i < N; i++) {
        for(unsigned char b = 0; b < N; b++)
            printf("%d ", buf[i]>>b & 1);
        printf("\n");
    }
}
