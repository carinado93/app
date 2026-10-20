/** German content. Same ids as the English texts in src/data. */
import type { ContentTranslation } from './content';

export const DE: ContentTranslation = {
  exercises: {
    sigh: {
      title: 'Physiologischer Seufzer',
      summary: 'Zweimal durch die Nase einatmen, einmal lange ausatmen. Der schnellste Weg, um herunterzukommen.',
      why: 'Das doppelte Einatmen öffnet winzige Lungenbläschen wieder, und das lange Ausatmen verlangsamt den Herzschlag. Es ist einer der schnellsten Wege, Stress im Moment zu senken.',
      steps: [
        'Atme durch die Nase ein.',
        'Oben angekommen, nimm noch einen kleinen Schluck Luft dazu.',
        'Lass alles langsam und lange durch den Mund ausströmen.',
      ],
    },
    butterfly: {
      title: 'Schmetterlings-Umarmung',
      summary: 'Kreuze die Arme und klopfe abwechselnd links und rechts. Dein Handy gibt den Rhythmus vor.',
      why: 'Langsames Klopfen im Wechsel von links und rechts (bilaterale Stimulation) hilft dem Gehirn, Stress zu verarbeiten, und gibt dem Körper das Gefühl, gehalten zu werden.',
      steps: [
        'Kreuze die Arme vor der Brust, die Hände ruhen unter den Schlüsselbeinen.',
        'Halte das Handy in einer Hand oder leg es auf deinen Schoß.',
        'Klopfe sanft mit der Hand auf der Seite, auf der das Handy vibriert.',
        'Atme langsam. Spüre, was sich verändert.',
      ],
    },
    orienting: {
      title: 'Orientieren',
      summary: 'Lass deinen Blick langsam durch den Raum wandern. Sag deinem Körper: Ich bin hier sicher.',
      why: 'Dein Nervensystem sucht ständig nach Gefahr. Wenn du dich langsam umsiehst, erfährt es, dass keine da ist, und schaltet den Alarm ab.',
      steps: [
        'Bewege Kopf und Augen langsam, als würdest du diesen Raum zum ersten Mal sehen.',
        'Finde etwas mit einer Farbe, die du magst. Lass deinen Blick dort ruhen.',
        'Finde etwas mit einer interessanten Oberfläche.',
        'Nimm ein Geräusch in der Ferne wahr. Dann ein Geräusch ganz nah.',
        'Spüre deine Füße auf dem Boden. Du bist hier. Du bist sicher.',
      ],
    },
    box: {
      title: 'Box-Atmung',
      summary: 'Ein 4, halten 4, aus 4, halten 4. Ruhiger Fokus für schwierige Momente.',
      why: 'Ein gleichmäßiger Rhythmus gibt dem Kopf etwas Einfaches zum Folgen und hält dich unter Druck klar und fokussiert.',
      steps: ['Atme 4 Sekunden ein.', 'Halte 4 Sekunden.', 'Atme 4 Sekunden aus.', 'Halte leer 4 Sekunden.'],
    },
    'long-exhale': {
      title: '4-7-8 zum Runterfahren',
      summary: 'Ein langes, langsames Ausatmen, das deinem Körper sagt: Jetzt ist Zeit zum Ausruhen.',
      why: 'Wenn das Ausatmen länger ist als das Einatmen, übernimmt der beruhigende Teil des Nervensystems.',
      steps: ['Atme 4 Sekunden durch die Nase ein.', 'Halte 7 Sekunden.', 'Atme 8 Sekunden durch den Mund aus.'],
    },
    shake: {
      title: 'Abschütteln',
      summary: 'Schüttle Hände, Arme und Beine aus, so wie du nach dem Schwimmen Wasser abschüttelst. Lass die Anspannung abfallen.',
      why: 'Schütteln ist einer der natürlichen Wege deines Körpers, aufgestaute Stressenergie loszulassen. Es lockert verspannte Muskeln und bringt einen müden, tauben Körper wieder ins Leben.',
      steps: [
        'Steh auf. Fang an, deine Hände locker auszuschütteln.',
        'Lass das Schütteln in Arme und Schultern wandern.',
        'Nimm die Beine dazu. Federe sanft in den Knien.',
        'Schüttle dich 20 Sekunden lang etwas kräftiger.',
        'Stopp. Steh still. Spüre das Kribbeln.',
      ],
    },
    affirmations: {
      title: 'Beruhigende Affirmationen',
      summary: 'Freundliche Sätze auf einem langsamen Ausatmen. Dein Körper hört, was du ihm sagst.',
      why: 'Ein langsames Ausatmen beruhigt den Körper, und eine freundliche, ruhige innere Stimme beruhigt den Kopf. Zusammen sagen sie deinem Nervensystem, dass du sicher und gehalten bist.',
      steps: [
        'Leg eine Hand auf dein Herz oder deinen Bauch. Atme sanft ein.',
        'Sag beim Ausatmen langsam: „Ich bin in diesem Moment sicher.“',
        'Atme ein. Beim Ausatmen: „Ich kann das Schritt für Schritt angehen.“',
        'Atme ein. Beim Ausatmen: „Ich muss nicht alles auf einmal schaffen.“',
        'Atme ein. Beim Ausatmen: „Ich darf mich ausruhen.“',
        'Wähle den Satz, der sich am besten angefühlt hat. Sag ihn noch dreimal, langsam.',
      ],
    },
    energize: {
      title: 'Aufwach-Atmung',
      summary: 'Ein etwas längeres Einatmen, um sanft Energie zurückzuholen.',
      why: 'Wenn das Einatmen länger ist als das Ausatmen, wird dein Körper ein wenig wacher. Sanfte Aktivierung für einen nebligen, tauben Zustand.',
      steps: ['Atme 5 Sekunden tief ein.', 'Kurze Pause.', 'Atme 3 Sekunden aus.'],
    },
    grounding: {
      title: '5-4-3-2-1 Erdung',
      summary: 'Nutze deine fünf Sinne, um ins Hier und Jetzt zurückzukommen.',
      why: 'Angst lebt in der Zukunft. Deine Sinne gibt es nur in der Gegenwart, deshalb holen sie dich dorthin zurück.',
      steps: [
        'Nenne 5 Dinge, die du sehen kannst.',
        'Nenne 4 Dinge, die du spüren kannst (Kleidung, Stuhl, Luft).',
        'Nenne 3 Dinge, die du hören kannst.',
        'Nenne 2 Dinge, die du riechen kannst.',
        'Nenne 1 Sache, die du schmecken kannst.',
      ],
    },
    feet: {
      title: 'Unsichtbarer Fußdruck',
      summary: 'Drück deine Füße unter dem Tisch in den Boden. Niemand wird es merken.',
      why: 'Gegen etwas Festes zu drücken gibt dem Körper ein Gefühl von Kraft und Stabilität.',
      steps: [
        'Drück beide Füße 5 Sekunden lang fest in den Boden.',
        'Lass los und spüre den Unterschied.',
        'Wiederhole es 3 Mal und atme dabei langsam aus.',
      ],
    },
    'self-hold': {
      title: 'Selbst-Halt',
      summary: 'Eine Hand auf dem Herzen, eine auf dem Bauch. Spüre, wie du dich selbst hältst.',
      why: 'Warme, sanfte Berührung setzt Oxytocin frei, das Hormon für Sicherheit und Verbundenheit.',
      steps: [
        'Leg eine Hand auf dein Herz und eine auf deinen Bauch.',
        'Spüre die Wärme deiner Hände.',
        'Lass deinen Atem unter deinen Händen fließen.',
        'Sag leise: „Ich bin für mich da.“',
      ],
    },
    'name-it': {
      title: 'Benennen, um zu beruhigen',
      summary: 'Gib dem, was du fühlst, ein Wort. Ein benanntes Gefühl wird kleiner.',
      why: 'Gefühle in Worte zu fassen aktiviert den denkenden Teil des Gehirns und dreht den Alarm leiser. Studien zeigen, dass schon das Benennen eines Gefühls seine Stärke verringert.',
      steps: [
        'Halte inne. Nimm wahr, was gerade in deinem Körper passiert.',
        'Finde ein Wort für das Gefühl: wütend, ängstlich, traurig, beschämt, überfordert…',
        'Sag es dir: „Das ist Überforderung.“',
        'Füge hinzu: „Und ich kann mit diesem Moment umgehen.“',
        'Atme einmal langsam aus.',
      ],
    },
    coherent: {
      title: 'Kohärente Atmung',
      summary: 'Ein 5, aus 5. Ein langsamer, gleichmäßiger Rhythmus, der Herz und Atem ins Gleichgewicht bringt.',
      why: 'Etwa sechs Atemzüge pro Minute hängen mit einer höheren Herzratenvariabilität zusammen, einem Zeichen für ein flexibles, widerstandsfähiges Nervensystem.',
      steps: ['Atme 5 Sekunden sanft durch die Nase ein.', 'Atme 5 Sekunden sanft aus.', 'Bleib dabei sanft, nie gezwungen.'],
    },
    'body-scan': {
      title: 'Kurzer Body-Scan',
      summary: 'Wandere von Kopf bis Fuß durch deinen Körper und nimm einfach wahr.',
      why: 'Stress zieht uns in den Kopf. Sanfte Aufmerksamkeit für den Körper verbindet dich wieder mit ihm und zeigt dir, wo du Anspannung hältst.',
      steps: [
        'Schließ die Augen oder senke den Blick. Spüre deinen Atem.',
        'Spüre Kopf und Gesicht. Mach Stirn und Kiefer weich.',
        'Spüre Nacken und Schultern. Lass sie ein wenig sinken.',
        'Spüre Brust und Bauch. Lass den Atem dorthin fließen.',
        'Spüre Arme und Hände. Lass sie schwer werden.',
        'Spüre Beine und Füße. Spüre den Boden.',
        'Spüre deinen ganzen Körper auf einmal. Nichts zu reparieren. Nur wahrnehmen.',
      ],
    },
    pmr: {
      title: 'Anspannen & Loslassen',
      summary: 'Spanne jeden Körperteil 5 Sekunden lang an und lass dann ganz los.',
      why: 'Das ist progressive Muskelentspannung. Der Unterschied zwischen Anspannung und Loslassen bringt deinem Körper bei, wie sich Loslassen anfühlt.',
      steps: [
        'Mach feste Fäuste. Halte 5 Sekunden… und lass los. Spüre den Unterschied.',
        'Zieh die Schultern zu den Ohren. Halte… und lass sie fallen.',
        'Kneif dein Gesicht zusammen. Halte… und mach es weich.',
        'Spanne den Bauch an. Halte… und lass los.',
        'Drück die Beine zusammen und streck die Zehen. Halte… und lass los.',
        'Atme langsam aus und spüre deinen ganzen Körper schwer und locker.',
      ],
    },
    'jaw-release': {
      title: 'Kiefer & Schultern lösen',
      summary: 'Löse die zwei Stellen, an denen sich Stress am liebsten versteckt.',
      why: 'Kiefer und Schultern spannen sich unter Stress automatisch an. Wenn du sie löst, sendet das ein Signal von Sicherheit zurück an dein Gehirn.',
      steps: [
        'Lass die Zähne leicht auseinander. Die Zunge ruht unten im Mund.',
        'Bewege den Kiefer sanft nach links und rechts.',
        'Roll die Schultern dreimal nach hinten.',
        'Lass die Schultern beim Ausatmen sinken.',
      ],
    },
    panoramic: {
      title: 'Panorama-Blick',
      summary: 'Weite deinen Blick, bis du den ganzen Raum siehst. Dein Kopf wird mit weit.',
      why: 'Stress verengt den Blick zu einem Tunnel. Wenn du den Blick sanft bis zu den Rändern weitest, merkt dein Nervensystem, dass es keine Gefahr gibt, auf die es sich konzentrieren muss.',
      steps: [
        'Schau auf einen Punkt vor dir.',
        'Nimm wahr, ohne die Augen zu bewegen, was an den Rändern ist: links, rechts, oben, unten.',
        'Lass deinen Blick weich und weit werden, wie beim Blick auf den Horizont.',
        'Bleib ein paar Atemzüge dabei.',
      ],
    },
    'heel-drop': {
      title: 'Fersen fallen lassen',
      summary: 'Geh auf die Zehenspitzen und lass dich auf die Fersen fallen. Ein sanfter Weckruf für einen tauben Körper.',
      why: 'Der kleine Ruck beim Landen auf den Fersen holt die Aufmerksamkeit zurück in den Körper und aktiviert ihn sanft, wenn du dich flach oder benebelt fühlst.',
      steps: [
        'Stell dich hüftbreit hin.',
        'Geh auf die Zehenspitzen.',
        'Lass dich sanft auf die Fersen fallen.',
        'Wiederhole es 15–20 Mal. Spüre die Vibration in deinem Körper.',
      ],
    },
    rocking: {
      title: 'Sanftes Wiegen',
      summary: 'Wiege dich langsam von Seite zu Seite, wie früher als Kind.',
      why: 'Rhythmische, langsame Bewegung ist eine der ältesten Arten, ein Nervensystem zu beruhigen. Deshalb wiegen wir Babys.',
      steps: [
        'Setz oder stell dich bequem hin.',
        'Fang an, dich langsam von Seite zu Seite zu wiegen.',
        'Lass deinen Atem den gleichen ruhigen Rhythmus finden.',
        'Mach weiter, bis es sich beruhigend anfühlt, dann werde langsamer und halte an.',
      ],
    },
    'worry-container': {
      title: 'Sorgen-Box',
      summary: 'Leg deine Sorgen in eine gedachte Box und schließ den Deckel bis morgen.',
      why: 'Dein Kopf hält Sorgen wach, weil er Angst hat, sie zu vergessen. Wenn du sie bewusst ablegst, darf er sich ausruhen.',
      steps: [
        'Stell dir einen stabilen Behälter vor: eine Box, einen Tresor, eine Truhe. Sieh seine Farbe und Form.',
        'Leg jede Sorge hinein, eine nach der anderen.',
        'Schließ den Deckel. Schließ ab, wenn du magst.',
        'Entscheide, wann du ihn wieder öffnest, zum Beispiel morgen um 10 Uhr.',
        'Stell den Behälter weit weg. Atme aus.',
      ],
    },
    'safe-place': {
      title: 'Sicherer Ort',
      summary: 'Stell dir einen Ort vor, an dem du dich ganz sicher fühlst, und lass deinen Körper es spüren.',
      why: 'Dein Nervensystem reagiert auf vorgestellte Erlebnisse fast wie auf echte. Ein lebendiger sicherer Ort wird zu einer inneren Kraftquelle, zu der du jederzeit zurückkehren kannst.',
      steps: [
        'Denk an einen Ort, an dem du dich sicher und ruhig fühlst. Echt oder ausgedacht.',
        'Was siehst du dort? Nimm Farben und Licht wahr.',
        'Was hörst du? Wie fühlt sich die Luft an?',
        'Spüre, wie sich dein Körper an diesem Ort anfühlt.',
        'Wähle ein Wort für diesen Ort. Mit diesem Wort kannst du jederzeit zurückkommen.',
      ],
    },
    'three-good': {
      title: 'Drei gute Dinge',
      summary: 'Nenne drei Dinge, die heute gut waren, egal wie klein.',
      why: 'Das Gehirn ist darauf ausgelegt, sich an Gefahr zu erinnern. Gute Momente bewusst wahrzunehmen gleicht das aus und hebt nachweislich mit der Zeit die Stimmung.',
      steps: [
        'Denk an eine Sache, die heute gut war. Auch etwas ganz Kleines.',
        'Eine zweite.',
        'Eine dritte.',
        'Frag dich bei einer davon: Was war mein Anteil daran?',
      ],
    },
    'wake-stretch': {
      title: 'Aufwach-Dehnung',
      summary: 'Drei große Dehnungen, um Energie zurück in einen schweren Körper zu bringen.',
      why: 'Dehnen bringt frisches Blut durch den Körper und macht sanft wacher, ohne das Tief nach dem nächsten Kaffee.',
      steps: [
        'Streck beide Arme zur Decke. Mach dich so groß, wie du kannst. Atme ein.',
        'Neig dich nach links, dann nach rechts. Spüre, wie sich deine Seiten öffnen.',
        'Verschränke die Hände hinter dem Rücken und öffne die Brust.',
        'Schüttle die Arme aus. Spüre die Energie.',
      ],
    },
    'eye-palming': {
      title: 'Augen-Palming',
      summary: 'Lass deine Augen nach der Bildschirmzeit in der warmen Dunkelheit deiner Hände ausruhen.',
      why: 'Bildschirme halten deine Augen in ständigem Fokus. Dunkelheit und Wärme geben den Augenmuskeln und dem Kopf eine echte Pause.',
      steps: [
        'Reib deine Handflächen aneinander, bis sie warm sind.',
        'Leg sie sanft gewölbt über die geschlossenen Augen. Ohne Druck.',
        'Genieß die Dunkelheit für fünf langsame Atemzüge.',
        'Nimm die Hände weg und öffne die Augen langsam.',
      ],
    },
    'sleep-wind-down': {
      title: 'Einschlaf-Ritual',
      summary: 'Eine kurze Routine im Bett, damit Körper und Kopf abschalten können.',
      why: 'Schlaf kommt, wenn sich das Nervensystem sicher fühlt. Diese Routine verbindet die Sorgen-Box, ein langes Ausatmen und Entspannung in einem Ablauf.',
      steps: [
        'Leg dich bequem hin. Leg das Handy nach jedem Schritt weg, wenn du magst.',
        'Leg die Sorgen von heute in deine gedachte Box und schließ den Deckel.',
        'Atme 4 Sekunden ein und 8 Sekunden aus. Fünfmal.',
        'Spanne deinen ganzen Körper 5 Sekunden lang an… und lass ganz los.',
        'Denk an drei gute Dinge von heute.',
        'Lass deinen Körper schwer werden. Spüre, wie die Matratze dich trägt.',
        'Heute gibt es nichts mehr zu tun. Gute Nacht.',
      ],
    },
  },
  programs: {
    'stress-reset': {
      title: '7 Tage',
      accent: 'Stress-Reset',
      summary: 'Eine sanfte erste Woche: Lerne, deinen Stress zu bemerken und deinen Körper mit einfachen Werkzeugen zu beruhigen.',
      days: [
        {
          title: 'Wahrnehmen',
          intro: 'Veränderung beginnt mit Wahrnehmen. Heute lernst du einfach zu sehen, wie es deinem Nervensystem geht.',
          task: 'Frag dich heute dreimal: Bin ich ruhig, aufgedreht oder abgeschaltet?',
          reflection: 'Wann hast du dich heute am ruhigsten gefühlt? Was war da los?',
        },
        {
          title: 'Deine eingebaute Bremse',
          intro: 'Dein Atem ist der schnellste Weg, deinen Körper zu beruhigen, und du hast ihn immer dabei.',
          task: 'Mach heute vor jeder neuen Aufgabe einen physiologischen Seufzer.',
          reflection: 'Was hat sich in deinem Körper nach dem Seufzer verändert?',
        },
        {
          title: 'Benennen',
          intro: 'Gefühle werden kleiner, wenn wir sie benennen. Heute übst du, dem, was du fühlst, ein Wort zu geben.',
          task: 'Wenn du dich heute gestresst fühlst, benenne das Gefühl mit einem Wort.',
          reflection: 'Welches Gefühl kam heute am häufigsten?',
        },
        {
          title: 'Gehalten sein',
          intro: 'Dein Körper beruhigt sich, wenn er sich gehalten fühlt. Dieses Gefühl kannst du dir selbst geben.',
          task: 'Leg vor dem Einschlafen zehn Atemzüge lang eine Hand auf dein Herz.',
          reflection: 'Wie fühlt es sich an, dich selbst zu trösten?',
        },
        {
          title: 'Ein kleines Nein',
          intro: 'Überforderung wächst oft aus zu vielen Jas. Heute übst du ein kleines, sicheres Nein.',
          task: 'Sag heute zu einer kleinen Sache Nein, zu der du sonst Ja sagen würdest.',
          reflection: 'Wie hat es sich angefühlt, Nein zu sagen? Was ist danach passiert?',
        },
        {
          title: 'Echte Pause',
          intro: 'Ruhe ist keine Belohnung, die du dir verdienen musst. Dein Nervensystem braucht sie jeden Tag.',
          task: 'Mach heute 10 Minuten Pause, in denen du nichts tust: kein Handy, keine Aufgaben.',
          reflection: 'Was war schwer daran, nichts zu tun? Was war gut?',
        },
        {
          title: 'Dein Werkzeugkasten',
          intro: 'Diese Woche hast du sechs Werkzeuge ausprobiert. Heute wählst du die, die für dich am besten funktionieren.',
          task: 'Schreib deine drei Lieblingswerkzeuge auf und wann du jedes davon nutzen wirst.',
          reflection: 'Was ist die eine Sache, die du aus dieser Woche mitnehmen möchtest?',
        },
      ],
    },
    'overwhelm-prevention': {
      title: '21 Tage',
      accent: 'Überforderung vorbeugen',
      summary:
        'Drei Wochen, um die ersten Anzeichen von Überlastung zu erkennen, deine Energie aufzufüllen und sie zu schützen, damit Stress nicht zu Burnout wird. Ein kleiner Schritt am Tag.',
      weeks: ['Woche 1 · Wahrnehmen', 'Woche 2 · Auftanken', 'Woche 3 · Schützen'],
      days: [
        {
          title: 'Wo du stehst',
          intro: 'Vorbeugung beginnt mit Wahrnehmen. Heute schaust du ehrlich hin, wie es dir geht. Ohne Urteil, nur wahrnehmen.',
          task: 'Schreib die drei Stresszeichen auf, die du gerade am stärksten an dir bemerkst.',
          reflection: 'Was versucht dein Körper dir in letzter Zeit zu sagen?',
        },
        {
          title: 'Energie-Check',
          intro: 'Manches raubt dir Energie, anderes gibt sie dir zurück. Heute findest du heraus, was was ist.',
          task: 'Mach zwei Listen: Was raubt mir Energie, was füllt mich auf. Mindestens fünf Dinge pro Liste.',
          reflection: 'Welcher Energieräuber hat dich überrascht?',
        },
        {
          title: 'Die erste Bremse',
          intro: 'Wenn die Tage zu voll werden, rutscht dein Körper in den Alarmmodus. Dein Atem ist die erste Bremse.',
          task: 'Mach die 4-7-8-Atmung einmal am Morgen und einmal vor dem Schlafen.',
          reflection: 'Wie hat dein Körper auf das lange Ausatmen reagiert?',
        },
        {
          title: 'Einen Energieräuber entfernen',
          intro: 'Du musst nicht alles reparieren. Nur einen Energieräuber, entfernt oder kleiner gemacht.',
          task: 'Wähle einen kleinen Energieräuber von deiner Liste und streiche, verschiebe oder verkleinere ihn diese Woche.',
          reflection: 'Was hast du gewählt, und wie fühlt es sich an, es loszulassen?',
        },
        {
          title: 'Schlaf zuerst',
          intro: 'Im Schlaf füllt dein Körper seine Energie auf. Deinen Schlaf zu schützen ist einer der stärksten Wege, Überlastung vorzubeugen.',
          task: 'Heute Abend keine Bildschirme in den letzten 30 Minuten vor dem Schlafen.',
          reflection: 'Wie hast du geschlafen? Was hat geholfen, was war im Weg?',
        },
        {
          title: 'Den Tag loslassen',
          intro: 'Stress sammelt sich im Körper. Heute lernst du, ihn rauszulassen, bevor er sich aufstaut.',
          task: 'Schüttle dich heute nach der Arbeit eine Minute lang aus oder mach einen flotten 10-Minuten-Spaziergang.',
          reflection: 'Was hast du nach dem Loslassen in deinem Körper bemerkt?',
        },
        {
          title: 'Zurückschauen',
          intro: 'Eine Woche. Was immer du geschafft hast, es zählt. Nicht alles auf einmal.',
          task: 'Lies deine Reflexionen dieser Woche. Markiere, was am meisten geholfen hat.',
          reflection: 'Was ist ein bisschen leichter als vor einer Woche?',
        },
        {
          title: 'Dein Rhythmus',
          intro: 'Dein Nervensystem tankt in kleinen Stücken über den Tag auf, nicht nur am Wochenende.',
          task: 'Stell dir heute drei Erinnerungen für eine 3-Minuten-Pause.',
          reflection: 'Haben sich die Pausen wie verlorene Zeit oder wie gewonnene Energie angefühlt?',
        },
        {
          title: 'Wieder lebendig werden',
          intro: 'Wenn sich Stress aufstaut, kann sich der Körper flach oder taub anfühlen. Heute wecken wir ihn sanft auf.',
          task: 'Verbring heute 15 Minuten im Tageslicht, am besten in Bewegung.',
          reflection: 'Was hast du heute in deinem Körper gespürt, auch wenn es nur wenig war?',
        },
        {
          title: 'Der Vagusnerv',
          intro: 'Ein langes, langsames Ausatmen ist direkt mit deinem Beruhigungssystem verbunden. Heute nutzt du es ganz bewusst.',
          task: 'Atme heute dreimal doppelt so lange aus, wie du einatmest.',
          reflection: 'Wie hat sich dein Körper nach dem langen Ausatmen angefühlt?',
        },
        {
          title: 'Weicher Blick',
          intro: 'Stress verengt unseren Blick. Heute übst du, ihn zu weiten, mit den Augen und mit dem Kopf.',
          task: 'Schau heute zwei Minuten lang in den Himmel oder zum Horizont.',
          reflection: 'Was hilft dir, das große Ganze zu sehen?',
        },
        {
          title: 'Freude ist Medizin',
          intro: 'Vorbeugung heißt nicht nur weniger Stress. Es heißt auch mehr von dem, was dich nährt.',
          task: 'Mach heute eine kleine Sache nur, weil sie dir Freude macht.',
          reflection: 'Was hast du gewählt? Wann hast du das zuletzt gemacht?',
        },
        {
          title: 'Verbindung',
          intro: 'Gemeinsam regulieren wir uns am besten. Ein freundlicher Mensch in der Nähe beruhigt unser Nervensystem.',
          task: 'Führ heute ein echtes Gespräch mit jemandem, der dir guttut.',
          reflection: 'Wie hast du dich nach dem Gespräch gefühlt?',
        },
        {
          title: 'Zurückschauen',
          intro: 'Zwei Wochen. Du baust neue Gewohnheiten auf, Schritt für Schritt.',
          task: 'Wähle deine drei bisherigen Lieblingswerkzeuge und schreib auf, wann du sie nutzt.',
          reflection: 'Was hat sich daran verändert, wie du mit Stress umgehst?',
        },
        {
          title: 'Deine Werte',
          intro: 'Grenzen fallen leichter, wenn du weißt, was du schützt. Heute findest du heraus, was dir am wichtigsten ist.',
          task: 'Schreib deine drei wichtigsten Werte im Leben gerade auf.',
          reflection: 'Wo passt dein Leben gerade zu deinen Werten, und wo nicht?',
        },
        {
          title: 'Jedes Ja ist ein Nein',
          intro: 'Jedes Ja zu jemand anderem ist ein Nein zu etwas von dir. Heute machst du diese Tauschgeschäfte sichtbar.',
          task: 'Halte heute vor jedem Ja kurz inne und frag dich: Wozu sage ich gerade Nein?',
          reflection: 'Welches Ja würdest du zurücknehmen, wenn du könntest?',
        },
        {
          title: 'Nein üben',
          intro: 'Nein sagen ist eine Fähigkeit, und Fähigkeiten brauchen Übung. Heute übst du zuerst an einem sicheren Ort.',
          task: 'Nutze diese Woche einen der geübten Sätze im echten Leben.',
          reflection: 'Was war leichter, als du erwartet hast?',
        },
        {
          title: 'Feierabend',
          intro: 'Wenn die Arbeit nie endet, ruht dein Nervensystem nie. Heute baust du ein klares Ende deines Arbeitstags.',
          task: 'Schaff dir ein Feierabend-Ritual: Laptop zu, die drei wichtigsten Dinge für morgen aufschreiben, rausgehen.',
          reflection: 'Wie hat sich dein Abend mit einem klaren Arbeitsende angefühlt?',
        },
        {
          title: 'Dein innerer Kritiker',
          intro: 'Viele von uns treiben sich mit einer harten inneren Stimme an. Heute probierst du eine freundlichere aus.',
          task: 'Wenn sich dein innerer Kritiker heute meldet, frag dich: Was würde ich einer guten Freundin sagen?',
          reflection: 'Was sagt dein innerer Kritiker am häufigsten? Was würde eine freundliche Stimme stattdessen sagen?',
        },
        {
          title: 'Dein Frühwarn-Plan',
          intro: 'Du kennst jetzt deine Stresszeichen. Lass uns dieses Wissen in einen Plan für die Zukunft verwandeln.',
          task: 'Schreib deinen Plan: „Wenn ich ___ bemerke, werde ich ___. Wenn es länger als ___ anhält, bitte ich ___ um Hilfe.“',
          reflection: 'Wer kann dich unterstützen, wenn es wieder schwer wird?',
        },
        {
          title: 'Zurück zu dir',
          intro: 'Drei Wochen. Du hast es Schritt für Schritt geschafft. Nicht alles auf einmal.',
          task: 'Schreib einen kurzen Brief an dich selbst in drei Monaten: Woran möchtest du dich erinnern?',
          reflection: 'Worauf bist du in diesen 21 Tagen am meisten stolz?',
        },
      ],
    },
  },
  gym: {
    foundations: {
      title: 'Grundlagen',
      focus: 'Lerne, deinen Zustand wahrzunehmen und zur Ruhe zurückzukommen.',
      sessions: {
        f1: { title: 'Lerne dein Nervensystem kennen', challenge: 'Frag dich heute dreimal: Bin ich ruhig, aufgedreht oder abgeschaltet?' },
        f2: { title: 'Der schnellste Reset', challenge: 'Mach einen physiologischen Seufzer, bevor du deine E-Mails öffnest.' },
        f3: { title: 'Gehalten sein', challenge: 'Leg vor dem Einschlafen 10 Atemzüge lang eine Hand auf dein Herz.' },
      },
    },
    regulation: {
      title: 'Regulation',
      focus: 'Verändere deinen Zustand bewusst: runter, wenn du aufgedreht bist, hoch, wenn du taub bist.',
      sessions: {
        r1: { title: 'Ruhig unter Druck', challenge: 'Mach in deiner nächsten stressigen Situation 3 Runden Box-Atmung.' },
        r2: { title: 'Energie rauslassen', challenge: 'Schüttle dich nach deinem nächsten schwierigen Gespräch 30 Sekunden lang aus.' },
        r3: { title: 'Sanft aufwachen', challenge: 'Streck dich in deinem nächsten nebligen Moment eine Minute lang, statt zu scrollen.' },
      },
    },
    capacity: {
      title: 'Belastbarkeit',
      focus: 'Trainiere deinen Körper, ruhig zu bleiben, wenn es ein bisschen unbequem wird.',
      sessions: {
        c1: { title: 'Eine freundliche innere Stimme', challenge: 'Wenn sich heute etwas schwer anfühlt, sag eine Affirmation langsam beim Ausatmen.' },
        c2: { title: 'Unbequem-Wiederholungen', challenge: 'Warte 2 Minuten, bevor du auf das Nächste reagierst, das dich ärgert.' },
        c3: { title: 'Länger ausatmen, länger ruhig', challenge: 'Mach 3 Abende hintereinander vor dem Schlafen 4 Runden 4-7-8-Atmung.' },
      },
    },
    resilience: {
      title: 'Resilienz',
      focus: 'Bleib im echten Leben mit dir verbunden, nicht nur auf der Matte.',
      sessions: {
        x1: { title: 'Ruhig im Raum', challenge: 'Nutze den unsichtbaren Fußdruck in deinem nächsten Meeting.' },
        x2: { title: 'Ruhig im Konflikt', challenge: 'Atme in deinem nächsten angespannten Gespräch einmal langsam aus, bevor du antwortest.' },
        x3: { title: 'Dein persönlicher Werkzeugkasten', challenge: 'Schreib deine 3 Lieblingsübungen auf und wo du jede davon nutzen wirst.' },
      },
    },
  },
  scenarios: {
    'boss-project': {
      title: 'Meine Führungskraft will, dass ich mehr übernehme',
      opening:
        'Hast du kurz eine Sekunde? Da ist etwas Dringendes reingekommen und ehrlich gesagt vertraue ich das nur dir an. Kannst du das diese Woche übernehmen?',
      phrases: [
        'Ich möchte das gut machen, und mit meiner aktuellen Arbeitslast kann ich das nicht. Was soll ich dafür liegen lassen?',
        'Ab nächstem Montag kann ich das machen, diese Woche nicht.',
        'Danke für dein Vertrauen. Meine Antwort ist im Moment Nein.',
      ],
    },
    'friend-favour': {
      title: 'Eine Freundin bittet um einen großen Gefallen',
      opening: 'Sooo… ich brauche einen riesigen Gefallen. Ich ziehe Samstag und Sonntag um und brauche dich echt. Du hast doch Zeit, oder?',
      phrases: [
        'Ich hab dich lieb und dieses Wochenende kann ich nicht. Ich brauche es, um aufzutanken.',
        'Beim Umzug kann ich nicht helfen, aber ich kann dir am Sonntagabend etwas zu essen vorbeibringen.',
        'Es liegt nicht an dir. Ich lerne gerade, meine Energie zu schützen.',
      ],
    },
    'family-guilt': {
      title: 'Meine Familie macht mir ein schlechtes Gewissen',
      opening: 'Du kommst am Sonntag nicht? Nach allem, was wir für dich getan haben… wir sehen dich ja kaum noch.',
      phrases: [
        'Ich hab euch lieb. Diesen Sonntag komme ich nicht, und das hat nichts mit Liebe zu tun.',
        'Ich höre, dass du enttäuscht bist. Meine Entscheidung bleibt trotzdem.',
        'Lass uns einen Tag finden, der für uns beide passt.',
      ],
    },
    'client-scope': {
      title: 'Ein Kunde will immer noch mehr',
      opening: 'Super, was du gemacht hast! Nur eine Kleinigkeit: Kannst du auch die Präsentation überarbeiten und ein paar Folien ergänzen? Geht doch schnell, oder?',
      phrases: [
        'Mache ich gern. Das ist nicht Teil unserer Vereinbarung, deshalb schicke ich dir ein Angebot.',
        'Das ist nicht enthalten. Hier sind zwei Möglichkeiten, wie wir es ergänzen können.',
        'Ich möchte die Qualität hoch halten, deshalb brauche ich dafür mehr Zeit.',
      ],
    },
    'partner-load': {
      title: 'Mein Partner überlässt mir alles',
      opening: 'Was ist los? Du wirkst schon wieder gestresst. Ist es die Arbeit?',
      phrases: [
        'Es ist nicht nur die Arbeit. Ich trage zu Hause zu viel, und ich brauche, dass wir es teilen.',
        'Kannst du ab jetzt die Einkäufe und die Planung für die Kinder übernehmen?',
        'Ich brauche keine Hilfe. Ich brauche, dass du einige Aufgaben ganz übernimmst.',
      ],
    },
    'after-hours': {
      title: 'Nachrichten nach Feierabend',
      opening: 'Hey, sorry, dass es so spät ist! Kurze Frage zu morgen: Kannst du mir die Datei heute Abend noch schicken?',
      phrases: [
        'Nach 18 Uhr bin ich offline. Ich schicke sie dir gleich morgen früh.',
        'Wenn es wirklich dringend ist, ruf bitte an. Sonst antworte ich morgen.',
        'Ich möchte bei der Arbeit ganz da sein, deshalb brauche ich meine Abende frei.',
      ],
    },
    'colleague-dump': {
      title: 'Eine Kollegin schiebt mir ihre Arbeit zu',
      opening: 'Du bist echt meine Rettung. Könntest du meinen Bericht für morgen fertig machen? Ich gehe total unter.',
      phrases: [
        'Ich sehe, dass du gestresst bist. Deinen Bericht kann ich nicht übernehmen, mein Teller ist auch voll.',
        'Ich kann dir 15 Minuten geben, um es gemeinsam durchzudenken, aber schreiben kann ich ihn nicht.',
        'Lass uns unsere Führungskraft bitten, Prioritäten zu setzen, damit keine von uns ausbrennt.',
      ],
    },
    'sick-day': {
      title: 'Die Arbeit ruft an, obwohl ich krank bin',
      opening: 'Hi! Sorry, dass ich störe, während du krank bist. Könntest du ganz kurz um 14 Uhr beim Kundentermin dabei sein? Sind nur 30 Minuten.',
      phrases: [
        'Ich bin heute krank und muss mich ausruhen, um gesund zu werden. Beim Termin bin ich nicht dabei.',
        'Bitte frag eine Kollegin, ob sie übernimmt, oder wir verschieben es, bis ich zurück bin.',
        'Ich bin zurück, sobald ich gesund bin. Bis dahin bin ich offline.',
      ],
    },
    'friend-venting': {
      title: 'Eine Freundin lädt immer alles bei mir ab',
      opening: 'Oh mein Gott, du glaubst nicht, was heute passiert ist. Hast du eine Stunde? Ich muss echt reden.',
      phrases: [
        'Du bist mir wichtig, und heute Abend habe ich keine Energie für ein langes Telefonat. Können wir morgen 20 Minuten reden?',
        'Ich kann dir 15 Minuten zuhören, dann muss ich mich ausruhen.',
        'Ich merke, dass ich in letzter Zeit auf Reserve laufe. Ich brauche, dass unsere Gespräche in beide Richtungen gehen.',
      ],
    },
    'school-volunteer': {
      title: 'Ich soll mich schon wieder engagieren',
      opening: 'Du hast das Sommerfest so toll gemacht! Den Wintermarkt machst du doch auch, oder? Niemand kann das so wie du.',
      phrases: [
        'Danke! Ich habe die letzten drei gemacht, deshalb sage ich dieses Mal Nein.',
        'Ich kann am Tag selbst eine Stunde helfen, aber organisieren werde ich es nicht.',
        'Das wäre eine gute Gelegenheit, dass jemand Neues es ausprobiert.',
      ],
    },
  },
  tinySteps: {
    calm: [
      'Schreib eine Sache auf, die du in deiner Woche schützen möchtest.',
      'Sag heute zu einer kleinen Sache Nein, zu der du sonst Ja sagen würdest.',
      'Geh 10 Minuten spazieren, ohne Handy.',
      'Trink ein Glas Wasser ganz langsam und schmecke es wirklich.',
      'Trag dir für morgen eine 15-Minuten-Pause in den Kalender ein.',
      'Schick eine Nachricht an jemanden, der dir guttut.',
      'Geh heute 15 Minuten früher ins Bett.',
    ],
    wired: [
      'Leg dein Handy für 20 Minuten in einen anderen Raum.',
      'Schreib die eine Sache auf, die dir am meisten Sorgen macht. Nur diese eine.',
      'Mach dein nächstes Ausatmen doppelt so lang wie das Einatmen.',
      'Lass die Schultern sinken. Lös deinen Kiefer. Jetzt gleich.',
      'Sag eine Sache ab oder verschiebe sie, die nicht dringend ist.',
      'Geh nach draußen und schau eine Minute lang in den Himmel.',
      'Iss deine nächste Mahlzeit im Sitzen, ohne Bildschirm.',
    ],
    shutdown: [
      'Steh auf und streck deine Arme zur Decke.',
      'Öffne ein Fenster und nimm drei Atemzüge frische Luft.',
      'Lass kühles Wasser über deine Handgelenke laufen.',
      'Mach ein Lied an, das du liebst, und beweg dich ein bisschen.',
      'Trink etwas Warmes.',
      'Geh für 5 Minuten ins Tageslicht.',
      'Schreib einem Menschen: „Ich denk an dich.“ oder „Wollte nur kurz hören, wie es dir geht.“',
    ],
  },
  quotes: [
    'Jeder Weg zurück zu dir beginnt mit einem kleinen Schritt.',
    'Nicht alles auf einmal. Nur der nächste Atemzug.',
    'Ruhe ist keine Belohnung. Sie ist eine Notwendigkeit.',
    'Du musst dir das Recht, langsamer zu werden, nicht verdienen.',
    'Kleine Schritte, freundlich gegangen, verändern alles.',
  ],
  articles: {
    'nervous-system': {
      title: 'Dein Nervensystem in 2 Minuten',
      intro: 'Dein Nervensystem entscheidet viele Male pro Sekunde, ob du sicher bist. Wie es antwortet, prägt, wie du fühlst, denkst und handelst.',
      sections: [
        {
          heading: 'Drei Zustände',
          text: 'Ein einfaches Bild dafür: Wenn du dich sicher fühlst, bist du ruhig und verbunden (☀️). Wenn dein System Gefahr spürt, schaltet es hoch auf Kampf oder Flucht: Herzrasen, angespannte Muskeln, rasende Gedanken (⛈️). Wenn die Gefahr zu groß wirkt oder zu lange anhält, kann es abschalten: taub, müde, benebelt, weit weg (🌫️).',
        },
        {
          heading: 'Keiner dieser Zustände ist falsch',
          text: 'Jeder Zustand ist der Versuch deines Körpers, dich zu schützen. Das Problem ist nicht der Stress selbst. Das Problem ist, wochen- oder monatelang im Alarm oder im Abschalten festzustecken, ohne zur Ruhe zurückzufinden.',
        },
        {
          heading: 'Du kannst es steuern',
          text: 'Aus einem Zustand kannst du dich nicht herausdenken, aber du kannst ihn mit deinem Körper verändern: mit deinem Atem, Bewegung, Berührung, deinen Augen und deiner Stimme. Genau das tut jede Übung in dieser App.',
        },
      ],
      takeaway: 'Nimm zuerst deinen Zustand wahr. Dann wähle das Werkzeug, das dazu passt.',
    },
    exhale: {
      title: 'Warum langes Ausatmen dich beruhigt',
      intro: 'Von allen Wegen, ruhiger zu werden, ist der Atem der einzige, den du immer dabeihast.',
      sections: [
        {
          heading: 'Dein Herz folgt deinem Atem',
          text: 'Wenn du einatmest, schlägt dein Herz ein bisschen schneller. Wenn du ausatmest, wird es langsamer. Das passiert automatisch, über den Vagusnerv.',
        },
        {
          heading: 'Mach das Ausatmen länger',
          text: 'Wenn dein Ausatmen länger ist als dein Einatmen, verbringst du mehr Zeit in der „Bremsphase“. Innerhalb von ein, zwei Minuten bekommt dein Körper die Botschaft: Wir sind sicher.',
        },
        {
          heading: 'Nicht erzwingen',
          text: 'Ruhiges Atmen ist weich und leise. Wenn dir schwindelig wird, atme kurz ganz normal. Klein und sanft wirkt besser als groß und dramatisch.',
        },
      ],
      takeaway: 'Atme doppelt so lange aus, wie du einatmest.',
    },
    'stress-cycle': {
      title: 'Stress ist nicht der Feind',
      intro: 'Stress ist Energie, die dein Körper bildet, um dir bei einer Herausforderung zu helfen. Schwierig wird es, wenn diese Energie nirgendwo hin kann.',
      sections: [
        {
          heading: 'Der Auslöser und der Stress',
          text: 'Der Auslöser ist die Sache: die Deadline, der Konflikt, die Rechnung. Der Stress ist das, was in deinem Körper passiert. Wenn das Problem gelöst ist, schaltet sich der Stress im Körper nicht automatisch ab.',
        },
        {
          heading: 'Den Kreis schließen',
          text: 'Dein Körper braucht ein Signal, dass die Gefahr vorbei ist. Bewegung, ein langes Ausatmen, ein gutes Weinen, Lachen, eine Umarmung von 20 Sekunden oder mehr oder kreativer Ausdruck können den Kreis schließen.',
        },
        {
          heading: 'Jeden Tag',
          text: 'Wenn du den Kreis nicht schließt, stapelt sich Stress von Tag zu Tag. Ein paar Minuten Loslassen am Tag sind echte Vorbeugung.',
        },
      ],
      takeaway: 'Kümmere dich um den Auslöser, und lass den Stress zusätzlich aus deinem Körper raus.',
    },
    'burnout-signs': {
      title: 'Frühe Warnzeichen für Burnout',
      intro: 'Burnout kommt selten über Nacht. Es schleicht sich langsam an, und die ersten Zeichen sind leicht zu übersehen.',
      sections: [
        {
          heading: 'Erschöpfung',
          text: 'Du wachst müde auf, auch nach dem Schlafen. Das Wochenende reicht nicht mehr zum Erholen. Kleine Aufgaben fühlen sich schwer an.',
        },
        {
          heading: 'Abstand',
          text: 'Du wirst zynischer oder reizbarer. Dinge, die dir wichtig waren, lassen dich kalt. Du ziehst dich von Menschen zurück.',
        },
        {
          heading: 'Weniger leisten können',
          text: 'Du arbeitest länger, schaffst aber weniger. Du zweifelst mehr an dir. Konzentration und Gedächtnis werden schlechter.',
        },
        {
          heading: 'Der Körper spricht',
          text: 'Kopfschmerzen, Magenprobleme, häufiges Kranksein, Verspannungen in Nacken und Rücken, Probleme beim Ein- oder Durchschlafen.',
        },
      ],
      takeaway: 'Wenn du über Wochen mehrere dieser Zeichen bei dir erkennst, nimm sie ernst. Sprich mit deiner Ärztin oder deinem Arzt und hol dir früh Unterstützung.',
    },
    'get-help': {
      title: 'Wenn Selbsthilfe nicht reicht',
      intro: 'Diese App kann dich unterstützen, aber manche Momente brauchen mehr als Übungen. Zu wissen, wann du Hilfe holst, ist eine Stärke.',
      sections: [
        {
          heading: 'Geh zu einer Ärztin oder Therapeutin, wenn…',
          text: 'du dich zwei Wochen oder länger an den meisten Tagen hoffnungslos oder leer fühlst; du deinen Alltag oder deine Arbeit nicht mehr schaffst; du oft Panikattacken hast; du wochenlang sehr schlecht schläfst; du Alkohol oder andere Substanzen nutzt, um klarzukommen.',
        },
        {
          heading: 'Hol dir sofort Hilfe, wenn…',
          text: 'du daran denkst, dir etwas anzutun oder nicht mehr leben zu wollen. Ruf jetzt den Notruf oder eine Krisenhotline an. Die Nummern findest du in deinem Profil unter „Krisenhilfe & Sicherheit“.',
        },
        {
          heading: 'Burnout und Depression',
          text: 'Sie können sich ähneln und gemeinsam auftreten. Nur Fachleute können den Unterschied feststellen. Das musst du nicht allein herausfinden.',
        },
      ],
      takeaway: 'Früh um Hilfe zu bitten ist der schnellste Weg zurück zu dir.',
    },
    shutdown: {
      title: 'Warum dein Körper manchmal abschaltet',
      intro: 'Sich taub, leer oder „nicht richtig da“ zu fühlen ist keine Faulheit. Es ist ein Schutzzustand.',
      sections: [
        {
          heading: 'Die Notbremse',
          text: 'Wenn Stress zu groß ist oder zu lange dauert, kann das Nervensystem die Notbremse ziehen. Die Energie sinkt, Gefühle werden leise, alles fühlt sich weit weg an.',
        },
        {
          heading: 'Nicht drücken, sanft anstupsen',
          text: 'Gegen das Abschalten hart anzukämpfen macht es oft schlimmer. Kleine, sanfte Aktivierung wirkt besser: Bewegung, kühles Wasser an den Handgelenken, Tageslicht, Summen, ein warmes Getränk, eine freundliche Stimme.',
        },
        {
          heading: 'Erst hoch, dann runter',
          text: 'Aus dem Abschalten herauszukommen kann sich zuerst nach mehr Unruhe anfühlen. Das ist normal: Du gehst auf dem Weg zurück zur Ruhe kurz durch den Alarm. Geh langsam.',
        },
      ],
      takeaway: 'Im Abschalten gilt: klein und sanft denken, eine kleine Bewegung nach der anderen.',
    },
    boundaries: {
      title: 'Grenzen sind Selbstfürsorge',
      intro: 'Viele Menschen, die ausbrennen, sind freundlich, zuverlässig und fleißig. Genau deshalb werden sie von allen gefragt.',
      sections: [
        {
          heading: 'Jedes Ja ist ein Nein zu etwas anderem',
          text: 'Wenn du Ja zu einem Extra-Projekt sagst, sagst du vielleicht Nein zu deinem Schlaf, deiner Familie oder deiner Gesundheit. Grenzen machen diesen Tausch sichtbar.',
        },
        {
          heading: 'Kurz ist freundlich',
          text: 'Ein klares „Nein, das kann ich nicht übernehmen“ ist freundlicher als eine lange Ausrede oder ein Ja, das du bereust. Du musst deine Grenzen nicht rechtfertigen.',
        },
        {
          heading: 'Schuldgefühle sind kein Stoppschild',
          text: 'Sich nach einer Grenze schuldig zu fühlen ist normal, vor allem am Anfang. Es bedeutet, dass du etwas Neues tust, nicht etwas Falsches.',
        },
      ],
      takeaway: 'Übe Nein-Sagen zuerst in kleinen, sicheren Situationen.',
    },
    sleep: {
      title: 'Schlaf und Stress: eine Straße in beide Richtungen',
      intro: 'Stress verschlechtert den Schlaf, und schlechter Schlaf verstärkt den Stress. Die gute Nachricht: Du kannst den Kreis von beiden Seiten durchbrechen.',
      sections: [
        {
          heading: 'Bewusst runterfahren',
          text: 'Dein Nervensystem kann nicht in einer Sekunde von 100 auf 0. Gib ihm 30–60 Minuten: gedimmtes Licht, keine Arbeit, keine Nachrichten und eine beruhigende Routine.',
        },
        {
          heading: 'Sorgen raus aus dem Bett',
          text: 'Schreib vor dem Schlafen deine To-dos für morgen auf oder nutze die Sorgen-Box. Dein Kopf lässt leichter los, wenn er weiß, dass nichts vergessen wird.',
        },
        {
          heading: 'Jeden Tag zur gleichen Zeit',
          text: 'Jeden Tag ungefähr zur gleichen Zeit aufzustehen, auch am Wochenende, ist eines der stärksten Werkzeuge für besseren Schlaf.',
        },
      ],
      takeaway: 'Behandle die Stunde vor dem Schlafen als Teil deines Schlafs.',
    },
    rest: {
      title: 'Ruhe ist keine Belohnung',
      intro: 'Viele von uns glauben, wir müssten uns Ruhe erst verdienen, indem wir alles erledigen. Aber die Liste endet nie.',
      sections: [
        {
          heading: 'Verschiedene Arten von Ruhe',
          text: 'Schlaf ist nur eine davon. Vielleicht brauchst du auch körperliche Ruhe, geistige Ruhe (eine Pause vom Denken), Sinnesruhe (weniger Lärm und Bildschirme), soziale Ruhe und kreative Ruhe (Natur, Kunst, Schönheit).',
        },
        {
          heading: 'Klein und oft',
          text: 'Fünf Minuten echte Ruhe alle 90 Minuten bringen mehr als ein langer Urlaub einmal im Jahr. Dein Nervensystem tankt in kleinen Stücken auf.',
        },
        {
          heading: 'Ruhen, bevor es zu viel wird',
          text: 'Der beste Moment für eine Pause ist, bevor du dich erschöpft fühlst, nicht danach.',
        },
      ],
      takeaway: 'Plane Ruhe wie einen Termin. Sie gehört zur Arbeit dazu.',
    },
    'tiny-steps': {
      title: 'Nicht alles auf einmal: warum kleine Schritte wirken',
      intro: 'Wenn wir etwas verändern wollen, versuchen wir oft, am Montag alles zu ändern. Am Donnerstag geben wir auf.',
      sections: [
        {
          heading: 'Klein ist nachhaltig',
          text: 'Ein Schritt, der so klein ist, dass er sich fast albern anfühlt, ist ein Schritt, den du wirklich gehst. Und ihn immer wieder zu gehen, baut Vertrauen in dich selbst auf.',
        },
        {
          heading: 'Einen Tag verpassen ist okay',
          text: 'Wichtig ist das Wiederkommen, nicht das Nie-Verpassen. Deshalb verzeiht dir deine Serie in dieser App einen verpassten Tag.',
        },
        {
          heading: 'Verknüpfe es mit etwas',
          text: 'Häng eine neue Gewohnheit an etwas, das du schon tust: ein langes Ausatmen, wenn du dich an den Schreibtisch setzt, drei gute Dinge beim Zähneputzen.',
        },
      ],
      takeaway: 'Jeder Weg zurück zu dir beginnt mit einem kleinen Schritt.',
    },
  },
};
