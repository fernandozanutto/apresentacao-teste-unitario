# Componente APLS TAB

Este componente possui 2 tipos de Header, o primeiro é o padrão e apresenta abas com o estilo default utilizado na aplicação;
O segundo é compacto e desenvolvido para utilização de icones ao inves de texto nos labels.

Para definir o Header a ser usado basta inserir o atributo 'headerIcones' e atribuir a ele o valor 'mostrar', caso não queira mais mostrar baste inserir 'esconder'. Desta forma é alternado o tipo de header do componente APLSTAB.

```
  <apls-tab-group headerIcones="mostrar"> <--- aqui
    <apls-tab>
      <ng-template aplsTabLabel>
        <i class="fas fa-camera"></i>
      </ng-template>
      <ng-template aplsTabContent>
        <content> </content>
      </ng-template>
    </apls-tab>
</apls-tab-group>

```
