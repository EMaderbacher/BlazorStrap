﻿using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Routing;
using Microsoft.AspNetCore.Components.Web;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BlazorStrap.Shared.Components.Common
{
    public abstract class BSNavItemBase : BlazorStrapBase, IDisposable
    {
        // ReSharper disable once NullableWarningSuppressionIsUsed
        [Inject] private NavigationManager NavigationManager { get; set; } = default!;

        /// <summary>
        /// Data-Blazorstrap attribute value to target.
        /// </summary>
        [Parameter] public string? Target { get; set; }

        /// <summary>
        /// Sets if the NavItem is active. If set each time your component is rendered, the active state will change to match the value set by your component. Use IsInitiallyActive to set the initial value if you just want to set the active state once.
        /// </summary>
        [Parameter] public bool? IsActive { get; set; }
        
        /// <summary>
        /// Set if the NavItem is active on initial render only. After that, it will be controlled by the parent.
        /// </summary>
        [Parameter] public bool IsInitiallyActive { get; set; }

        /// <summary>
        /// Sets if the NavItem is disabled.
        /// </summary>
        [Parameter] public bool IsDisabled { get; set; }

        /// <summary>
        /// Sets if the NavItem is a dropdown.
        /// </summary>
        [Parameter] public bool IsDropdown { get; set; }

        /// <summary>
        /// Removes the <c>nav-item</c> class.
        /// </summary>
        [Parameter] public bool NoNavItem { get; set; }

        /// <summary>
        /// Display nav item as active if a child route of the nav item is active.
        /// </summary>
        [Parameter] public bool ActiveOnChildRoutes { get; set; } = false;

        /// <summary>
        /// CSS class to apply to the nav bar list items.
        /// </summary>
        [Parameter] public string? ListItemClass { get; set; }

        /// <summary>
        /// Event called when item is clicked.
        /// </summary>
        [Parameter] public EventCallback<MouseEventArgs> OnClick { get; set; }

        /// <summary>
        /// Prevent default on click behavior.
        /// </summary>
        [Parameter] public bool PreventDefault { get; set; }

        /// <summary>
        /// Content of tab.
        /// </summary>
        [Parameter] public RenderFragment? TabContent { get; set; }

        /// <summary>
        /// Tab label.
        /// </summary>
        [Parameter] public RenderFragment? TabLabel { get; set; }

        /// <summary>
        /// Url for nav link.
        /// </summary>
        [Parameter] public string? Url { get; set; } = "javascript:void(0);";

        [CascadingParameter] public BSNavBase? Parent { get; set; }
        private bool _canHandleActive;
        private bool _isActiveInitialValueSet;
        protected override void OnInitialized()
        {
            if (IsActive is null)
            {
                _canHandleActive = true;
                if (NavigationManager.Uri == NavigationManager.BaseUri + Url?.TrimStart('/'))
                    IsActive = true;
                if (NavigationManager.Uri.Contains(NavigationManager.BaseUri + Url?.TrimStart('/')) && ActiveOnChildRoutes)
                    IsActive = true;
                NavigationManager.LocationChanged += OnLocationChanged;
            }
        }

        private void OnLocationChanged(object? sender, LocationChangedEventArgs e)
        {
           
            if (!_canHandleActive) return;
            if (Parent?.IsTabs ?? false) return;
            IsActive = false;
            if (NavigationManager.Uri == NavigationManager.BaseUri + Url?.TrimStart('/'))
                IsActive = true;
            if (NavigationManager.Uri.Contains(NavigationManager.BaseUri + Url?.TrimStart('/')) && ActiveOnChildRoutes)
                IsActive = true;
            StateHasChanged();
        }

        protected override void OnParametersSet()
        {
            if (IsInitiallyActive && !_isActiveInitialValueSet)
            {
                IsActive = true;
            }

            if (Parent == null) return;
            if (Parent.IsTabs)
            {
                if(Parent.ActiveChild == null)
                    IsActive = Parent.SetFirstChild(this);
                
                // Override the active child if isActive is set to true
                if (IsActive == true)
                    Parent.SetFirstChild(this, true);
            }
            Parent.ChildHandlerString += Parent_ChildHandlerString;
            Parent.ChildHandler += Parent_ChildHandler;
            _isActiveInitialValueSet = true;
        }

        private async void Parent_ChildHandlerString(string name)
        {
            if(name == DataId)
                Parent?.Invoke(this);
        }

        protected async Task ClickEvent()
        {
            if (!string.IsNullOrEmpty(Target))
                BlazorStrapService.ForwardClick(Target);

            if (OnClick.HasDelegate)
                await OnClick.InvokeAsync();
            if (Parent?.IsTabs ?? false)
            {
                Parent.Invoke(this);
            }
        }

        protected abstract Task ChildHandler(BSNavItemBase sender);
        private async void Parent_ChildHandler(BSNavItemBase sender)
        {
            if (Parent != null)
                    IsActive = Parent.ActiveChild == this;
            await ChildHandler(sender);
            await InvokeAsync(StateHasChanged);
        }

        public void Deactivate()
        {
            IsActive = false;
            StateHasChanged();
        }
        
        public void Invoke()
        {
            if (Parent != null)
                Parent.Invoke(this);
        }
        public void Dispose()
        {
            if (_canHandleActive)
                NavigationManager.LocationChanged -= OnLocationChanged;
            if (Parent == null) return;
            if (Parent.ActiveChild == this)
                Parent.ActiveChild = null;
            Parent.ChildHandler -= Parent_ChildHandler;
            Parent.ChildHandlerString -= Parent_ChildHandlerString;
        }
        protected abstract string? LayoutClass { get; }
        protected abstract string? ClassBuilder { get; }
        protected abstract string? ListClassBuilder { get; }
    }
}
