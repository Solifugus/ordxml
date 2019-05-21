

String.prototype.hasNext = function ( seeking, pos = 0 ) {
	let has = false;
	for( let i = 0; i < seeking.length; i += 1 ) {
		if( this.substr( pos, seeking[i].length ) === seeking[i] ) {
			has = true;
			break;
		}
	}
	return has;
}

String.prototype.getNext = function ( seeking, pos = 0 ) {
	let found = undefined;
	for( let i = 0; i < seeking.length; i += 1 ) {
		if( this.substr( pos, seeking[i].length ) === seeking[i] ) {
			found = seeking[i];
			break;
		}
	}
	return found;
}

// First first position in string not of seeking string character (if string else string if array)
String.prototype.firstFound = function ( seeking, pos = 0 ) {
	while( pos < this.length ) {
		if( this.hasNext( seeking, pos ) ) break;
		pos += 1;
	}
	if( pos >= this.length ) pos = -1;
	return pos;
};

// First first position in string not of seeking string character (if string else string if array)
String.prototype.firstNotFound = function ( seeking, pos = 0 ) {
	while( pos < this.length ) {
		if( !this.hasNext( seeking, pos ) ) break;
		pos += 1;
	}
	if( pos >= this.length ) pos = -1;
	return pos;
};


class OrdXml {
	constructor( setup ) {
		// TODO: add params
		//    forgiving: true = let anything go unless critical
		//    flattags: true = no hierarchy; false = hierarchy; array of strings = hierarchy except for specified tag names
	}

	parse( xml, tag = { name:'', attrib:{}, elems:[] } ) {
		xml = ( typeof xml === 'string' ) ? { raw:xml, pos:0, upto:'' } : xml;
		
		let heirarchy = [tag];  // current path to place in heirarchy of tags 
	
		while( xml.pos < xml.raw.length ) {
			
			// Find Next "<" and ">" 
			let nextLeft = xml.raw.indexOf( '<', xml.pos);
			let nextRight = xml.raw.indexOf( '>', nextLeft+1 );
			if( nextRight === -1 ) {  // If no ">", error out..
				console.error( 'Missing closing ">" after ' + placeInCode( xml.raw, xml.pos ) );
				return undefined;
			}

			// Store any text before "<"
			if( nextLeft > xml.pos ) tag.elems.push( xml.raw.substring( xml.pos, nextLeft ) );  // a tag of type "string" is atomic/terminal

			// If no "<" then store all remaining text and return
			if( nextLeft === -1 ) {
				if( xml.pos < xml.length-1 ) tag.elems.push( xml.raw.substr( xml.pos ) );
				return tag;
			}

			// Get Tag Name (including any preceeding '/')
			let name = xml.raw.substr(nextLeft+1).match(/^[^\s<>]*/)[0];  // Ultra-Forgiving Tag Identification
			let attribsBegin = nextLeft + name.length;
			let attribsEnd   = xml.raw.firstFound( ['/','>'], attribsBegin ) - 1;

			// Grab Attributes
			//let attribs = xml.raw.substring( attribsBegin, attribsEnd ).match(/[A-Za-z0-0_\-]+\s*=\s*[^\s]*/gm);
			let attribs = xml.raw.substring( attribsBegin, attribsEnd ).match(/[^\s]+\s*=\s*[^\s]*/gm);
			if( attribs !== null ) {
				for( let i = 0; i < attribs.length; i += 1 ) {
					let halves = attribs[i].split('=');
					tag.attrib[halves[0].trim()] = halves[1].trim();  // TODO: (1) If already, make array; (2) make case-insensitive (optionally)
				}
			}
			
			// If Closing Tag
			if( name[0] !== '/' ) tag.name = name;
			
			// Is Start of Self-Closing Tag?
			let selfClosing = false;
			if( xml.raw[nextRight-1] === '/' ) selfClosing = true;  // TODO: allow whitespace between / and >			

			// Entered New Tag 
			xml.pos = nextRight + 1;

			// Is tag self-ending?
			if( xml.raw[nextRight-1] === '/' ) {
				return tag;
			}
			else {
					tag.elems.push( this.parse( xml, { name:name, attrib:{}, elems:[] } ) );
			}

		} // end of while( pos < xml.length )

	}  // end of parse() method
	
} // end of Ordxml class

ordxml = new OrdXml();
xml = 'before<outer one="1" two="2">inside</outer>after';
console.log( 'XML: ' + JSON.stringify(xml) );
console.log( JSON.stringify( ordxml.parse(xml), null, '  ') );




