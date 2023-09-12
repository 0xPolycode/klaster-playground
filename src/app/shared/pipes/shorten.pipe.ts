import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shorten'
})
export class ShortenPipe implements PipeTransform {

  transform(value: string | undefined | null, start: number, end: number): string {
    if(!value) { return "" }
    const startString = value.substring(0, start)
    const endString = value.substring((value.length - 1) - end, value.length - 1)
    return `${startString}...${endString}`
  }

}
