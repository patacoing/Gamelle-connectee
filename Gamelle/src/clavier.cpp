#ifndef CLAVIER
#define CLAVIER
#include <clavier.h>
#endif

#ifndef TRAITEMENT
#define TRAITEMENT
#include <traitement.h>
#endif

#ifndef KEYPAD
#define KEYPAD
#include <Keypad.h> //https://github.com/Chris--A/Keypad
#endif

const char keyPadTab[LIGNE][COLONNE] = {{'1', '2', '3', 'A'}, {'4', '5', '6', 'B'}, {'7', '8', '9', 'C'}, {'*', '0', '#', 'D'}};
byte ligneKpPin[4] = {PIN7, PIN6, PIN5, PIN4};
byte colonneKpPin[4] = {PIN3, PIN2, PIN1, PIN0};
Keypad keypad = Keypad(makeKeymap(keyPadTab), ligneKpPin, colonneKpPin, LIGNE, COLONNE);

char readKeypad()
{
    char input;
    input = keypad.getKey();
    return input;
}
void checkKeypad()
{
    char input = readKeypad();
    if (input != NO_KEY)
    {
        traitementClavier(input);
    }
}
