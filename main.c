#include <stdio.h>
#define N 8
static unsigned short   buf[N];

#define CLEAN_BUFF() do{\
    for(unsigned char t = 0; t < N; t++)\
        buf[t] = 0;\
} while(0);

#define ABS(x) (((x)>=0)?(x):(x)*-1)


static unsigned char isLeagul(unsigned char x, unsigned char y);
static void q(char y);
static void console();


int main() {
    CLEAN_BUFF();
    q(0);
    console();
}


unsigned char isLeagul(unsigned char x, unsigned char y) {
    unsigned short coluOr = 0;
    for(unsigned char i = 0; i < N; i++) {
        coluOr |= buf[i] & (1<<x);
    }
    unsigned short delta = 0;
    for(unsigned char i = 0; i < N; i++) {
        delta |= ((buf[i]>>ABS(y-i)) | (buf[i]<<ABS(y-i))) & (1<<x);
    }
    if((buf[y]==0) && (coluOr==0) && (delta == 0))
        return 1;
    else
        return 0;
}
unsigned char flag = 0;
void q(char y) {
    if(y >= N) {
        console();
    }
    for(unsigned char x = 0; x < N; x++) {
        if(isLeagul(x, y)) {
            buf[y] |= 1<<x;
            q(y+1);
            break;
        }
        if(x==N-1) {
            printf("Error at %d\n", y);
            flag++;
            y -= 1;
            if(y<0) y=0;
            buf[y] = buf[y]<<1;
            q(y);
        }
    }
}
void console() {
    printf("----\n");
    for(unsigned char i = 0; i < N; i++) {
        for(unsigned char b = 0; b < N; b++)
            printf("%d ", buf[i]>>b & 1);
        printf("\n");
    }
}
