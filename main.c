#define N 8

static unsigned char        buf[N+1];

#define CLEAN_BUFF() do{\
    for(unsigned char t = 0; t <= N; t++)\
        buf[t] = 0;\
} while(0);

#define ABS(x) (((x)>=0)?(x):(x)*-1)


static unsigned char isLeagul(unsigned char x, unsigned char y);
static void q(unsigned char y);
static void console();


int main() {
    CLEAN_BUFF();
    q(1);
    console();

}


unsigned char isLeagul(unsigned char x, unsigned char y) {

    // Row
    if(buf[y]) {
        return 0;
    }
    // Column
    for(unsigned char t = 1; t <= N; t++) {
        if(buf[t] == x) {
            return 0;

        }
    }
    // 斜线
    // |dX/dY|
    unsigned char delta = ABS(x-y);
    for(unsigned char y = 1; y <= N; y++) {

        if(ABS(buf[y]-y) == delta) {
            return 0;
        }
    }

    return 1;
}

void q(unsigned char y) {
    if(y >= N) {
        console();
        return 0;
    }
    for(unsigned char x = 1; x <= N; x++) {
        if(isLeagul(x, y)) {
            buf[y] = x;
            q(y+1);
        }
    }
}
void console() {
    printf("----\n");
    for(unsigned char i = 1; i <= N; i++) {
        printf("%d, %d\n", i,buf[i]);
    }
}
