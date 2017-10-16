import {
    ElementRef,
    Renderer2
} from '@angular/core';
import { MDCRippleFoundation, util } from '@material/ripple';
import { asBoolean, asBooleanOrNull } from '../../utils/value.utils';
import { MdcRippleAdapter } from './mdc.ripple.adapter';
import { MdcEventRegistry } from '../../utils/mdc.event.registry';

// cast to correct type (string); getMatchesProperty is annotated as returning string[], but it does actually return a string:
const matchesProperty: string = <any>util.getMatchesProperty(HTMLElement.prototype);

export abstract class AbstractMdcRipple {
    private mdcRippleAdapter: MdcRippleAdapter = {
        browserSupportsCssVars: () => util.supportsCssVariables(window),
        isUnbounded: () => this.isRippleUnbounded(),
        isSurfaceActive: () => this.isRippleSurfaceActive(),
        isSurfaceDisabled: () => this.isRippleSurfaceDisabled(),
        addClass: (className: string) => this.addClassToRipple(className),
        removeClass: (className: string) => this.removeClassFromRipple(className),
        registerInteractionHandler: (type: string, handler: EventListener) => {
            this._registry.listen(this._renderer, type, handler, this.getRippleInteractionElement(), util.applyPassive());
        },
        deregisterInteractionHandler: (type: string, handler: EventListener) => {
            this._registry.unlisten(type, handler);
        },
        registerResizeHandler: (handler: EventListener) => {
            this._registry.listenElm(this._renderer, 'resize', handler, window);
        },
        deregisterResizeHandler: (handler: EventListener) => {
            this._registry.unlisten('resize', handler);
        },
        updateCssVariable: (name: string, value: string) => this._renderer.setStyle(this._rippleElm.nativeElement, name, value),
        computeBoundingRect: () => this.computeRippleBoundingRect(),
        getWindowPageOffset: () => ({x: window.pageXOffset, y: window.pageYOffset})
    }
    private rippleFoundation: {
        init(),
        destroy(),
        activate(),
        deactivate()
    };

    constructor(protected _rippleElm: ElementRef, protected _renderer: Renderer2, protected _registry: MdcEventRegistry) {}

    protected initRipple() {
        if (this.rippleFoundation)
            throw new Error('initRipple() is called multiple times');
        this.rippleFoundation = new MDCRippleFoundation(this.mdcRippleAdapter);
        this.rippleFoundation.init();
    }

    protected destroyRipple() {
        if (this.rippleFoundation) {
            this.rippleFoundation.destroy();
            this.rippleFoundation = null;
        }
    }

    protected isRippleInitialized() {
        return this.rippleFoundation != null;
    }

    activateRipple() {
        if (this.rippleFoundation)
            this.rippleFoundation.activate();
    }

    deactivateRipple() {
        if (this.rippleFoundation)
            this.rippleFoundation.deactivate();
    }

    protected getRippleInteractionElement() {
        return this._rippleElm;
    }

    protected isRippleUnbounded() {
        return false;
    }

    protected isRippleSurfaceActive() {
        let interactionElm = this.getRippleInteractionElement();
        if (interactionElm == null)
            return false;
        return this.isActiveElement(interactionElm.nativeElement);
    }

    protected isActiveElement(element: HTMLElement) {
        return element == null ? false : element[matchesProperty](':active');
    }

    protected isRippleSurfaceDisabled() {
        let interactionElm = this.getRippleInteractionElement();
        if (interactionElm == null)
            return true;
        return !!interactionElm.nativeElement.attributes.getNamedItem('disabled');
    }

    protected addClassToRipple(name: string) {
        this._renderer.addClass(this._rippleElm.nativeElement, name);
    }

    protected removeClassFromRipple(name: string) {
        this._renderer.removeClass(this._rippleElm.nativeElement, name);
    }

    protected computeRippleBoundingRect() {
        return this._rippleElm.nativeElement.getBoundingClientRect();
    }
}
