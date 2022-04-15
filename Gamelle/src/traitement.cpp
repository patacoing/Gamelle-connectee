#include <Arduino.h>
#ifndef Screen
#define Screen
#include <screen.h>
#endif

#ifndef TRAITEMENT
#define TRAITEMENT
#include <traitement.h>
#endif

#ifndef CLAVIER
#define CLAVIER
#include <clavier.h>
#endif

#ifndef WEBSOCKET
#define WEBSOCKET
#include <webSocket.h>
#endif

extern GUI_Bitmap_t bmbienvenue;
extern GUI_Bitmap_t bmmenu_principal;
extern GUI_Bitmap_t bmmenu_showmeal;
extern GUI_Bitmap_t bmrenseignerpoids;
extern GUI_Bitmap_t bmrenseigner_heure;
extern GUI_Bitmap_t bmchoix_poids_heure;

void traitementClavier(char input)
{
    switch (input)
    {
    case MENU_CREATION:
        traitementAjout();
        break;
    case MENU_SUPPRESSION:
        traitementUpdateDelete(SUPPRESSION);
        break;
    case MENU_MODIFICATION:
        traitementUpdateDelete(MODIFICATION);
        break;
    default:
        break;
    }
}

void traitementUpdateDelete(char choix)
{
    char index;
    afficherImage(&bmmenu_showmeal, 0, 0);
    DynamicJsonDocument json = afficherMenu();
    index = getMenu();
    if (index == -1)
        afficherImage(&bmmenu_principal, 0, 0);
    else
    {
        if (choix == SUPPRESSION)
            deleateMeal(index, json);
        else if (choix == MODIFICATION)
        {
            traitementUpdate(index);
        }
        afficherImage(&bmmenu_principal, 0, 0);
    }
}

char getMenu()
{
    char index = -1;
    char input;
    do
    {
        input = readKeypad();
        if (input >= 0 && input <= 9)
        {
            index = input;
            break;
        }
        delay(20);
    } while (input != 'B');
    return index;
}
DynamicJsonDocument afficherMenu()
{
    String s = "";
    char *str;
    int compteurY = 0;
    DynamicJsonDocument json = getAllMeal();
    int i = 0;
    while (!json["repas"][i].isNull())
    {
        s = "";
        s.concat(i + 1);
        s.concat(" : ");
        String heures = json["repas"][i]["heures"];
        s.concat(" ");
        s.concat(heures);
        String poids = json["repas"][i]["poids"];
        s.concat(poids);
        s.concat(" g");
        s.toCharArray(str, s.length());
        if (i == 3)
            compteurY = 0;
        if (i < 4)
        {
            afficherString(str, 2, compteurY);
        }
        else
        {
            afficherString(str, 66, compteurY);
        }
        compteurY += 10;
        i++;
    }
    return json;
}
void traitementUpdate(int index)
{
    char input;
    do
    {
        input = readKeypad();
        delay(20);
    } while (input != 'C' || input != 'D' || input != 'B');

    if (input != 'B')
    {
        afficherImage(&bmchoix_poids_heure, 0, 0);
        int poids = getPoids();
        char *heure = getHeure();
        if (poids == -1 || heure[0] - 1 || heure[1] == -1)
            afficherImage(&bmmenu_principal, 0, 0);
    }
    afficherImage(&bmmenu_principal, 0, 0);
}

void traitementAjout()
{
    int poids = getPoids();
    char *heure = getHeure();
    if (poids == -1 || heure[0] - 1 || heure[1] == -1)
        afficherImage(&bmmenu_principal, 0, 0);

    // TODO: écrire dans le json et l'envoyer
}

char getPoids()
{
    afficherImage(&bmrenseignerpoids, 0, 0);
    char chiffre[3];
    int poids = 0;
    int indexDizaine = 0;
    int tabDizaine[3];
    tabDizaine[2] = 100;
    tabDizaine[1] = 10;
    tabDizaine[0] = 1;
    char length;
    char input;
    do
    {
        input = readKeypad();
        if (input >= 0 && input <= 9)
        {
            chiffre[indexDizaine] = (char)input;
            indexDizaine++;
        }
        delay(20);
    } while (input != 'A' || input != 'B');
    if (input == 'B')
        return -1; // retour

    length = indexDizaine;
    for (int i = 0; i < length; i++)
    {
        poids += chiffre[i] * tabDizaine[indexDizaine];
        indexDizaine--;
    }
    return poids;
    // TODO: ecrire les chiffres du poids
}
char *getHeure()
{
    afficherImage(&bmrenseigner_heure, 0, 0);
    char heure[2];
    heure[0] = checkHeure();
    heure[1] = checkMinute();
    return heure;
}
char checkHeure()
{
    char heure;
    char compteurPuissance = 10;
    char compteurIteration = 0;
    char input;
    boolean flag = false;
    do
    {
        input = readKeypad();
        if (input == 'B')
            return -1;
        if (input >= 0 && input <= 9)
        {
            heure = input * compteurPuissance;
            compteurPuissance = compteurPuissance / 10;
            compteurIteration++;
            if (compteurIteration == 2 && heure >= 24)
            {
                compteurIteration = 0;
                heure = 0;
                flag = true;
                // TODO: ecrire les chiffres des hueures et supprimer l'heure de l'écran si non valide
            }
        }
        delay(20);
    } while (flag == false);
    return heure;
}

char checkMinute()
{
    char minutes;
    char compteurPuissance = 10;
    char compteurIteration = 0;
    char input;
    boolean flag = false;
    do
    {
        input = readKeypad();
        if (input == 'B')
            return -1;
        if (input >= 0 && input <= 9)
        {
            minutes = input * compteurPuissance;
            compteurPuissance = compteurPuissance / 10;
            compteurIteration++;
            if (compteurIteration == 2 && minutes >= 60)
            {
                compteurIteration = 0;
                minutes = 0;
                flag = true;
                // TODO:  pareil comme au dessus
            }
        }
        delay(20);
    } while (flag == true);
    return minutes;
}
