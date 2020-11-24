interface Number {
    formatarCasasDecimais(precisao, separadorDecimal, separadorMilhar): number;
    _toFixed(fixed): string;
}

/**
 * Função utilizada para formatar o número de acordo com as casas decimmais
 * @param precisao - Quantidade de Casas que deseja precisão. Ex: 2
 * @param separadorDecimal - Separador para casas decimais. Ex: ','
 * @param separadorMilhar - Separador para casas de milhar. Ex: '.'
 */
Number.prototype.formatarCasasDecimais = function(precisao: number, separadorDecimal: string, separadorMilhar: string) {
    if(this == undefined){
        return; 
    }
    
    let number = this;
    number = number._toFixed(10);
    let isNegativo = number < 0;
    
    var n = number, prec = precisao;
    n = !isFinite(+n) ? 0 : +n;
    prec = !isFinite(+prec) ? 0 : Math.abs(prec);
    var dec = (typeof separadorDecimal == "undefined") ? '.' : separadorDecimal;
    var sep = (typeof separadorMilhar == "undefined") ? ',' : separadorMilhar;
 
    var s = (prec > 0) ? n._toFixed(prec) : Math.round(n).toFixed(prec); //fix for IE parseFloat(0.55).toFixed(0) = 0;
 
    var abs = Math.abs(n).toFixed(prec);
    var _, i;
 
    _ = abs.split(/\D/);
    i = _[0].length % 3 || 3;

    _[0] = s.slice(0,i + (n < 0)) +
            _[0].slice(i).replace(/(\d{3})/g, sep+'$1');

    s = _.join(dec);
 
    if(s.charAt(0) === '-') {
        return s;
    } else {
        return (isNegativo ? '-' : '') + s;
    }	
}

/**
 * @autor: Rogerio
 * @since: 26/12/2018
 * 
 * Foi necessario criar essa funcao, pois o toFixed arredondava automaticamente. 
 * Ex: ao utilizar o toFixed do numero 79.9989, ele arredondava para 80.00. Este erro
 * so ocorre com duas casas decimais, para 3 ou mais, ele arredonda normal. Mas esta
 * funcao pode utilizar qualquer arredondamento sem problemas
 */
Number.prototype._toFixed = function(fixed): string {
    let number = this;
    var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
    return number.toString().match(re)[0];
}